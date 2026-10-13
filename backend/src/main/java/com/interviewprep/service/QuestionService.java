package com.interviewprep.service;

import com.interviewprep.dto.QuestionCreateRequest;
import com.interviewprep.entity.Difficulty;
import com.interviewprep.entity.Question;
import com.interviewprep.entity.Subject;
import com.interviewprep.entity.Topic;
import com.interviewprep.exception.BadRequestException;
import com.interviewprep.exception.ResourceNotFoundException;
import com.interviewprep.repository.QuestionRepository;
import com.interviewprep.repository.SubjectRepository;
import com.interviewprep.repository.TopicRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;

    public QuestionService(QuestionRepository questionRepository,
                           SubjectRepository subjectRepository,
                           TopicRepository topicRepository) {
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
    }

    public Page<Question> getQuestions(Long subjectId, Difficulty difficulty, String search, Pageable pageable) {
        return questionRepository.searchQuestions(subjectId, difficulty, search, pageable);
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
    }

    @Transactional
    public Question createQuestion(QuestionCreateRequest req) {
        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + req.getSubjectId()));

        Topic topic = null;
        if (req.getTopicId() != null) {
            topic = topicRepository.findById(req.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + req.getTopicId()));
        }

        Question q = new Question();
        q.setSubject(subject);
        q.setTopic(topic);
        q.setDifficulty(req.getDifficulty());
        q.setQuestionText(req.getQuestionText());
        q.setCodeSnippet(req.getCodeSnippet());
        q.setOptionA(req.getOptionA());
        q.setOptionB(req.getOptionB());
        q.setOptionC(req.getOptionC());
        q.setOptionD(req.getOptionD());
        q.setCorrectOption(req.getCorrectOption().toUpperCase());
        q.setExplanation(req.getExplanation());
        q.setMarks(req.getMarks());
        q.setNegativeMarks(req.getNegativeMarks());
        q.setActive(req.getActive() != null ? req.getActive() : true);

        return questionRepository.save(q);
    }

    @Transactional
    public Question updateQuestion(Long id, QuestionCreateRequest req) {
        Question q = getQuestionById(id);

        if (!q.getSubject().getId().equals(req.getSubjectId())) {
            Subject subject = subjectRepository.findById(req.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + req.getSubjectId()));
            q.setSubject(subject);
        }

        if (req.getTopicId() != null) {
            Topic topic = topicRepository.findById(req.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + req.getTopicId()));
            q.setTopic(topic);
        } else {
            q.setTopic(null);
        }

        q.setDifficulty(req.getDifficulty());
        q.setQuestionText(req.getQuestionText());
        q.setCodeSnippet(req.getCodeSnippet());
        q.setOptionA(req.getOptionA());
        q.setOptionB(req.getOptionB());
        q.setOptionC(req.getOptionC());
        q.setOptionD(req.getOptionD());
        q.setCorrectOption(req.getCorrectOption().toUpperCase());
        q.setExplanation(req.getExplanation());
        q.setMarks(req.getMarks());
        q.setNegativeMarks(req.getNegativeMarks());
        if (req.getActive() != null) {
            q.setActive(req.getActive());
        }

        return questionRepository.save(q);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question q = getQuestionById(id);
        questionRepository.delete(q);
    }

    public List<Question> getRandomQuestions(Long subjectId, Long topicId, Difficulty difficulty, int count) {
        String diffStr = (difficulty == null || difficulty == Difficulty.ALL) ? "ALL" : difficulty.name();
        List<Question> matching = questionRepository.findMatchingQuestions(subjectId, topicId, diffStr, difficulty);

        if (matching.isEmpty()) {
            // Fallback: If not enough questions in specific difficulty/topic, get from the subject
            matching = questionRepository.findBySubjectIdAndActiveTrue(subjectId);
        }

        if (matching.isEmpty()) {
            throw new BadRequestException("No questions available for the selected criteria.");
        }

        Collections.shuffle(matching);
        return matching.stream().limit(count).toList();
    }
}
