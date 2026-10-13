package com.interviewprep.service;

import com.interviewprep.entity.Subject;
import com.interviewprep.entity.SubjectNote;
import com.interviewprep.entity.Topic;
import com.interviewprep.exception.BadRequestException;
import com.interviewprep.exception.ResourceNotFoundException;
import com.interviewprep.repository.SubjectNoteRepository;
import com.interviewprep.repository.SubjectRepository;
import com.interviewprep.repository.TopicRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final SubjectNoteRepository subjectNoteRepository;

    public SubjectService(SubjectRepository subjectRepository,
                          TopicRepository topicRepository,
                          SubjectNoteRepository subjectNoteRepository) {
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
        this.subjectNoteRepository = subjectNoteRepository;
    }

    @Cacheable(value = "subjects_active")
    public List<Subject> getAllActiveSubjects() {
        return subjectRepository.findByActiveTrue();
    }

    @Cacheable(value = "subjects_all")
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Cacheable(value = "subject_by_id", key = "#id")
    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
    }

    @Cacheable(value = "topics_by_subject", key = "#subjectId")
    public List<Topic> getTopicsBySubjectId(Long subjectId) {
        return topicRepository.findBySubjectId(subjectId);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "subjects_active", allEntries = true),
        @CacheEvict(value = "subjects_all", allEntries = true),
        @CacheEvict(value = "admin_dashboard", allEntries = true)
    })
    public Subject createSubject(Subject subject) {
        if (subjectRepository.existsByNameIgnoreCase(subject.getName())) {
            throw new BadRequestException("Subject already exists: " + subject.getName());
        }
        return subjectRepository.save(subject);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "subjects_active", allEntries = true),
        @CacheEvict(value = "subjects_all", allEntries = true),
        @CacheEvict(value = "subject_by_id", key = "#id"),
        @CacheEvict(value = "admin_dashboard", allEntries = true)
    })
    public Subject updateSubject(Long id, Subject subjectDetails) {
        Subject subject = getSubjectById(id);
        subject.setName(subjectDetails.getName());
        subject.setDescription(subjectDetails.getDescription());
        subject.setIcon(subjectDetails.getIcon());
        subject.setColor(subjectDetails.getColor());
        if (subjectDetails.getActive() != null) {
            subject.setActive(subjectDetails.getActive());
        }
        return subjectRepository.save(subject);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "subjects_active", allEntries = true),
        @CacheEvict(value = "subjects_all", allEntries = true),
        @CacheEvict(value = "subject_by_id", key = "#id"),
        @CacheEvict(value = "topics_by_subject", key = "#id"),
        @CacheEvict(value = "notes_by_subject", key = "#id"),
        @CacheEvict(value = "admin_dashboard", allEntries = true)
    })
    public void deleteSubject(Long id) {
        Subject subject = getSubjectById(id);
        subjectRepository.delete(subject);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "topics_by_subject", key = "#subjectId"),
        @CacheEvict(value = "subject_by_id", key = "#subjectId"),
        @CacheEvict(value = "subjects_active", allEntries = true),
        @CacheEvict(value = "subjects_all", allEntries = true)
    })
    public Topic createTopic(Long subjectId, Topic topic) {
        Subject subject = getSubjectById(subjectId);
        topic.setSubject(subject);
        return topicRepository.save(topic);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "topics_by_subject", allEntries = true),
        @CacheEvict(value = "subject_by_id", allEntries = true),
        @CacheEvict(value = "subjects_active", allEntries = true),
        @CacheEvict(value = "subjects_all", allEntries = true)
    })
    public void deleteTopic(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));
        topicRepository.delete(topic);
    }

    @Cacheable(value = "notes_by_subject", key = "#subjectId")
    public List<SubjectNote> getNotesBySubjectId(Long subjectId) {
        return subjectNoteRepository.findBySubjectIdOrderByIdAsc(subjectId);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "notes_by_subject", key = "#subjectId"),
        @CacheEvict(value = "subject_by_id", key = "#subjectId"),
        @CacheEvict(value = "subjects_active", allEntries = true),
        @CacheEvict(value = "subjects_all", allEntries = true)
    })
    public SubjectNote createNote(Long subjectId, SubjectNote note) {
        Subject subject = getSubjectById(subjectId);
        note.setSubject(subject);
        return subjectNoteRepository.saveAndFlush(note);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "notes_by_subject", allEntries = true),
        @CacheEvict(value = "subject_by_id", allEntries = true),
        @CacheEvict(value = "subjects_active", allEntries = true),
        @CacheEvict(value = "subjects_all", allEntries = true)
    })
    public void deleteNote(Long noteId) {
        SubjectNote note = subjectNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note link not found with id: " + noteId));
        subjectNoteRepository.delete(note);
    }
}
