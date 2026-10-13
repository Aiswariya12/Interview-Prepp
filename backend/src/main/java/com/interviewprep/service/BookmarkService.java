package com.interviewprep.service;

import com.interviewprep.entity.Bookmark;
import com.interviewprep.entity.Question;
import com.interviewprep.entity.User;
import com.interviewprep.exception.BadRequestException;
import com.interviewprep.exception.ResourceNotFoundException;
import com.interviewprep.repository.BookmarkRepository;
import com.interviewprep.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final QuestionRepository questionRepository;
    private final AuthService authService;

    public BookmarkService(BookmarkRepository bookmarkRepository,
                           QuestionRepository questionRepository,
                           AuthService authService) {
        this.bookmarkRepository = bookmarkRepository;
        this.questionRepository = questionRepository;
        this.authService = authService;
    }

    @Transactional
    public Bookmark toggleBookmark(Long questionId, String notes) {
        User user = authService.getCurrentAuthenticatedUser();
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));

        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndQuestionId(user.getId(), questionId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            bookmarkRepository.flush();
            return null;
        } else {
            Bookmark b = new Bookmark(user, question, notes);
            return bookmarkRepository.saveAndFlush(b);
        }
    }

    @Transactional(readOnly = true)
    public List<Bookmark> getMyBookmarks() {
        User user = authService.getCurrentAuthenticatedUser();
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(Long questionId) {
        User user = authService.getCurrentAuthenticatedUser();
        return bookmarkRepository.existsByUserIdAndQuestionId(user.getId(), questionId);
    }
}
