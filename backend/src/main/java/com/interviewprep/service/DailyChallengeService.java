package com.interviewprep.service;

import com.interviewprep.entity.DailyChallenge;
import com.interviewprep.entity.Question;
import com.interviewprep.entity.Subject;
import com.interviewprep.repository.DailyChallengeRepository;
import com.interviewprep.repository.QuestionRepository;
import com.interviewprep.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
public class DailyChallengeService {

    private final DailyChallengeRepository dailyChallengeRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;

    public DailyChallengeService(DailyChallengeRepository dailyChallengeRepository,
                                 QuestionRepository questionRepository,
                                 SubjectRepository subjectRepository) {
        this.dailyChallengeRepository = dailyChallengeRepository;
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional
    public DailyChallenge getOrCreateTodayChallenge() {
        LocalDate today = LocalDate.now();
        return dailyChallengeRepository.findByChallengeDate(today).orElseGet(() -> {
            List<Subject> subjects = subjectRepository.findByActiveTrue();
            Subject targetSubject = subjects.isEmpty() ? null : subjects.get((int) (Math.abs(today.toEpochDay()) % subjects.size()));

            DailyChallenge challenge = new DailyChallenge(
                    today,
                    "Daily Tech Sprint: " + (targetSubject != null ? targetSubject.getName() : "General"),
                    "Sharpen your skills today with 5 curated high-frequency interview questions.",
                    targetSubject
            );

            List<Question> questions = targetSubject != null
                    ? questionRepository.findBySubjectIdAndActiveTrue(targetSubject.getId())
                    : questionRepository.findAll();

            if (!questions.isEmpty()) {
                Collections.shuffle(questions);
                challenge.setQuestions(new java.util.LinkedHashSet<>(questions.stream().limit(5).toList()));
            }

            return dailyChallengeRepository.saveAndFlush(challenge);
        });
    }
}
