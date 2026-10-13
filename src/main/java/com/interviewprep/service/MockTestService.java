package com.interviewprep.service;

import com.interviewprep.dto.*;
import com.interviewprep.entity.*;
import com.interviewprep.exception.BadRequestException;
import com.interviewprep.exception.ResourceNotFoundException;
import com.interviewprep.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MockTestService {

    private final MockTestRepository mockTestRepository;
    private final MockQuestionRepository mockQuestionRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final QuestionService questionService;
    private final AuthService authService;
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final UserBadgeRepository userBadgeRepository;

    public MockTestService(MockTestRepository mockTestRepository,
                           MockQuestionRepository mockQuestionRepository,
                           SubjectRepository subjectRepository,
                           TopicRepository topicRepository,
                           QuestionService questionService,
                           AuthService authService,
                           BookmarkRepository bookmarkRepository,
                           UserRepository userRepository,
                           UserBadgeRepository userBadgeRepository) {
        this.mockTestRepository = mockTestRepository;
        this.mockQuestionRepository = mockQuestionRepository;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
        this.questionService = questionService;
        this.authService = authService;
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    @Transactional
    public MockTestDetailDto startMockTest(StartMockRequest req) {
        User user = authService.getCurrentAuthenticatedUser();

        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + req.getSubjectId()));

        Topic topic = null;
        if (req.getTopicId() != null) {
            topic = topicRepository.findById(req.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + req.getTopicId()));
        }

        List<Question> questions = questionService.getRandomQuestions(
                req.getSubjectId(), req.getTopicId(), req.getDifficulty(), req.getNumberOfQuestions()
        );

        MockTest mockTest = new MockTest();
        mockTest.setUser(user);
        mockTest.setSubject(subject);
        mockTest.setTopic(topic);
        mockTest.setDifficulty(req.getDifficulty());
        mockTest.setTotalQuestions(questions.size());
        mockTest.setDurationMinutes(req.getDurationMinutes());
        mockTest.setIsNegativeMarking(req.getNegativeMarking());
        mockTest.setNegativeMarkValue(0.25);
        mockTest.setStatus(MockTestStatus.IN_PROGRESS);

        double maxScore = 0.0;
        for (Question q : questions) {
            maxScore += (q.getMarks() != null ? q.getMarks() : 1.0);
        }
        mockTest.setMaxScore(maxScore);

        int order = 1;
        for (Question q : questions) {
            MockQuestion mq = new MockQuestion(mockTest, q, order++);
            mockTest.getMockQuestions().add(mq);
        }

        mockTest = mockTestRepository.saveAndFlush(mockTest);

        return MockTestDetailDto.fromEntity(mockTest);
    }

    @Transactional(readOnly = true)
    public MockTestDetailDto getMockTestById(Long testId) {
        User user = authService.getCurrentAuthenticatedUser();
        MockTest test = mockTestRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Mock test not found: " + testId));

        if (!test.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You are not authorized to view this mock test");
        }

        return MockTestDetailDto.fromEntity(test);
    }

    @Transactional
    public void saveAnswer(Long testId, SubmitAnswerRequest req) {
        MockQuestion mq = mockQuestionRepository.findById(req.getMockQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Mock question not found: " + req.getMockQuestionId()));

        if (req.getSelectedOption() != null && !req.getSelectedOption().trim().isEmpty()) {
            mq.setSelectedOption(req.getSelectedOption().trim().toUpperCase());
            mq.setIsSkipped(false);
        } else {
            mq.setSelectedOption(null);
            mq.setIsSkipped(true);
        }

        if (req.getIsMarkedForReview() != null) {
            mq.setIsMarkedForReview(req.getIsMarkedForReview());
        }

        mockQuestionRepository.saveAndFlush(mq);
    }

    @Transactional
    public MockTestResultDto submitMockTest(SubmitMockRequest req) {
        User user = authService.getCurrentAuthenticatedUser();

        MockTest test = mockTestRepository.findById(req.getMockTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Mock test not found: " + req.getMockTestId()));

        if (test.getStatus() == MockTestStatus.COMPLETED) {
            return getMockTestResult(test.getId());
        }

        // Apply any answers submitted in batch
        if (req.getAnswers() != null && !req.getAnswers().isEmpty()) {
            for (SubmitAnswerRequest ansReq : req.getAnswers()) {
                if (ansReq.getMockQuestionId() != null) {
                    mockQuestionRepository.findById(ansReq.getMockQuestionId()).ifPresent(mq -> {
                        if (ansReq.getSelectedOption() != null && !ansReq.getSelectedOption().trim().isEmpty()) {
                            mq.setSelectedOption(ansReq.getSelectedOption().trim().toUpperCase());
                            mq.setIsSkipped(false);
                        } else {
                            mq.setSelectedOption(null);
                            mq.setIsSkipped(true);
                        }
                        if (ansReq.getIsMarkedForReview() != null) {
                            mq.setIsMarkedForReview(ansReq.getIsMarkedForReview());
                        }
                    });
                }
            }
        }

        List<MockQuestion> questions = mockQuestionRepository.findByMockTestIdOrderByQuestionOrderAsc(test.getId());

        double totalScore = 0.0;
        int correctCount = 0;
        int wrongCount = 0;
        int skippedCount = 0;
        boolean isNegativeMarking = Boolean.TRUE.equals(test.getIsNegativeMarking());

        for (MockQuestion mq : questions) {
            Question q = mq.getQuestion();
            String selected = mq.getSelectedOption();

            if (selected == null || selected.trim().isEmpty()) {
                mq.setIsSkipped(true);
                mq.setIsCorrect(false);
                mq.setMarksObtained(0.0);
                skippedCount++;
            } else if (selected.equalsIgnoreCase(q.getCorrectOption())) {
                mq.setIsSkipped(false);
                mq.setIsCorrect(true);
                double marks = (q.getMarks() != null ? q.getMarks() : 1.0);
                mq.setMarksObtained(marks);
                totalScore += marks;
                correctCount++;
            } else {
                mq.setIsSkipped(false);
                mq.setIsCorrect(false);
                double penalty = isNegativeMarking ? (q.getNegativeMarks() != null ? q.getNegativeMarks() : 0.25) : 0.0;
                mq.setMarksObtained(-penalty);
                totalScore -= penalty;
                wrongCount++;
            }
        }

        mockQuestionRepository.saveAllAndFlush(questions);

        totalScore = Math.round(totalScore * 100.0) / 100.0;
        double maxScore = test.getMaxScore() > 0 ? test.getMaxScore() : questions.size();
        double percentage = maxScore > 0 ? Math.max(0.0, (totalScore / maxScore) * 100.0) : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0;

        int attempted = correctCount + wrongCount;
        double accuracy = attempted > 0 ? ((double) correctCount / attempted) * 100.0 : 0.0;
        accuracy = Math.round(accuracy * 100.0) / 100.0;

        test.setScore(totalScore);
        test.setPercentage(percentage);
        test.setAccuracy(accuracy);
        test.setCorrectCount(correctCount);
        test.setWrongCount(wrongCount);
        test.setSkippedCount(skippedCount);
        test.setTimeTakenSeconds(req.getTimeTakenSeconds() != null ? req.getTimeTakenSeconds() : 0);
        test.setStatus(MockTestStatus.COMPLETED);
        test.setCompletedAt(LocalDateTime.now());

        mockTestRepository.saveAndFlush(test);

        // Update streak & user stats
        updateUserStreakAndBadges(user, percentage, attempted);

        return buildResultDto(test, questions, user.getId());
    }

    @Transactional(readOnly = true)
    public MockTestResultDto getMockTestResult(Long testId) {
        User user = authService.getCurrentAuthenticatedUser();
        MockTest test = mockTestRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Mock test not found: " + testId));

        List<MockQuestion> questions = mockQuestionRepository.findByMockTestIdOrderByQuestionOrderAsc(test.getId());
        return buildResultDto(test, questions, user.getId());
    }

    @Transactional(readOnly = true)
    public List<MockTestSummaryDto> getStudentHistory() {
        User user = authService.getCurrentAuthenticatedUser();
        return mockTestRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(MockTestSummaryDto::fromEntity)
                .collect(Collectors.toList());
    }

    private MockTestResultDto buildResultDto(MockTest test, List<MockQuestion> questions, Long userId) {
        List<Bookmark> userBookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Set<Long> bookmarkedQuestionIds = userBookmarks.stream()
                .map(b -> b.getQuestion().getId())
                .collect(Collectors.toSet());

        List<QuestionResultDto> questionResults = questions.stream()
                .map(mq -> QuestionResultDto.fromEntity(mq, bookmarkedQuestionIds.contains(mq.getQuestion().getId())))
                .collect(Collectors.toList());

        return MockTestResultDto.fromEntity(test, questionResults);
    }

    private void updateUserStreakAndBadges(User user, double percentage, int attempted) {
        LocalDate today = LocalDate.now();
        if (user.getLastPracticeDate() == null) {
            user.setStreakDays(1);
        } else {
            LocalDate lastDate = user.getLastPracticeDate().toLocalDate();
            if (lastDate.equals(today.minusDays(1))) {
                user.setStreakDays(user.getStreakDays() + 1);
            } else if (!lastDate.equals(today)) {
                user.setStreakDays(1);
            }
        }
        user.setLastPracticeDate(LocalDateTime.now());
        userRepository.saveAndFlush(user);

        // Badges check
        awardBadgeIfEligible(user, "FIRST_MOCK", "First Mock Completed", "Completed your first mock test on the platform", "🎯");
        if (percentage >= 90.0) {
            awardBadgeIfEligible(user, "HIGH_ACHIEVER", "High Achiever", "Scored 90% or higher in a mock assessment", "🏆");
        }
        if (percentage == 100.0) {
            awardBadgeIfEligible(user, "PERFECT_SCORE", "Flawless Execution", "Scored a perfect 100% in a mock test", "⚡");
        }
        if (user.getStreakDays() >= 7) {
            awardBadgeIfEligible(user, "STREAK_7", "7-Day Streak", "Practiced consistently for 7 consecutive days", "🔥");
        }
    }

    private void awardBadgeIfEligible(User user, String key, String name, String desc, String icon) {
        if (!userBadgeRepository.existsByUserIdAndBadgeKey(user.getId(), key)) {
            UserBadge badge = new UserBadge(user, key, name, desc, icon);
            userBadgeRepository.saveAndFlush(badge);
        }
    }
}
