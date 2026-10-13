package com.interviewprep.controller;

import com.interviewprep.dto.*;
import com.interviewprep.entity.Role;
import com.interviewprep.entity.Subject;
import com.interviewprep.entity.SubjectNote;
import com.interviewprep.entity.Topic;
import com.interviewprep.entity.Question;
import com.interviewprep.repository.UserRepository;
import com.interviewprep.service.AnalyticsService;
import com.interviewprep.service.QuestionService;
import com.interviewprep.service.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import com.interviewprep.entity.MockTest;
import com.interviewprep.entity.MockTestStatus;
import com.interviewprep.repository.MockTestRepository;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Management", description = "Endpoints for administrator controls, questions, subjects, and users")
public class AdminController {

    private final AnalyticsService analyticsService;
    private final SubjectService subjectService;
    private final QuestionService questionService;
    private final UserRepository userRepository;
    private final MockTestRepository mockTestRepository;

    public AdminController(AnalyticsService analyticsService,
                           SubjectService subjectService,
                           QuestionService questionService,
                           UserRepository userRepository,
                           MockTestRepository mockTestRepository) {
        this.analyticsService = analyticsService;
        this.subjectService = subjectService;
        this.questionService = questionService;
        this.userRepository = userRepository;
        this.mockTestRepository = mockTestRepository;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get overall platform analytics for admin dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getAdminDashboard() {
        AdminDashboardDto dto = analyticsService.getAdminDashboardData();
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/students")
    @Operation(summary = "Get all registered students with interview statistics")
    public ResponseEntity<ApiResponse<List<UserDto>>> getStudents() {
        List<UserDto> students = userRepository.findByRole(Role.ROLE_STUDENT)
                .stream()
                .map(u -> {
                    UserDto dto = UserDto.fromEntity(u);
                    long testCount = mockTestRepository.countByUserIdAndStatus(u.getId(), MockTestStatus.COMPLETED);
                    Double avg = mockTestRepository.getAveragePercentageByUserId(u.getId());
                    Double max = mockTestRepository.getMaxPercentageByUserId(u.getId());
                    dto.setTotalTests((int) testCount);
                    dto.setAverageScore(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
                    dto.setBestScore(max != null ? Math.round(max * 10.0) / 10.0 : 0.0);
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(students));
    }

    @GetMapping("/interviews")
    @Operation(summary = "Get all student interviews taken across the platform")
    public ResponseEntity<ApiResponse<List<MockTestSummaryDto>>> getAllInterviews() {
        List<MockTest> tests = mockTestRepository.findAllByOrderByCreatedAtDesc();
        List<MockTestSummaryDto> dtos = tests.stream()
                .map(MockTestSummaryDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/students/{studentId}/interviews")
    @Operation(summary = "Get all interviews taken by a specific student")
    public ResponseEntity<ApiResponse<List<MockTestSummaryDto>>> getStudentInterviews(@PathVariable Long studentId) {
        List<MockTest> tests = mockTestRepository.findByUserIdOrderByCreatedAtDesc(studentId);
        List<MockTestSummaryDto> dtos = tests.stream()
                .map(MockTestSummaryDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @PostMapping("/subjects")
    @Operation(summary = "Create a new subject")
    public ResponseEntity<ApiResponse<Subject>> createSubject(@RequestBody Subject subject) {
        Subject created = subjectService.createSubject(subject);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Subject created", created));
    }

    @PutMapping("/subjects/{id}")
    @Operation(summary = "Update subject details")
    public ResponseEntity<ApiResponse<Subject>> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        Subject updated = subjectService.updateSubject(id, subject);
        return ResponseEntity.ok(ApiResponse.ok("Subject updated", updated));
    }

    @DeleteMapping("/subjects/{id}")
    @Operation(summary = "Delete subject")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.ok("Subject deleted successfully", null));
    }

    @PostMapping("/subjects/{subjectId}/topics")
    @Operation(summary = "Create topic under subject")
    public ResponseEntity<ApiResponse<Topic>> createTopic(@PathVariable Long subjectId, @RequestBody Topic topic) {
        Topic created = subjectService.createTopic(subjectId, topic);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Topic created", created));
    }

    @DeleteMapping("/topics/{topicId}")
    @Operation(summary = "Delete topic")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long topicId) {
        subjectService.deleteTopic(topicId);
        return ResponseEntity.ok(ApiResponse.ok("Topic deleted successfully", null));
    }

    @PostMapping("/subjects/{subjectId}/notes")
    @Operation(summary = "Add note link under subject")
    public ResponseEntity<ApiResponse<SubjectNote>> createNote(@PathVariable Long subjectId, @RequestBody SubjectNote note) {
        SubjectNote created = subjectService.createNote(subjectId, note);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Note link added successfully", created));
    }

    @DeleteMapping("/subjects/notes/{noteId}")
    @Operation(summary = "Delete note link")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long noteId) {
        subjectService.deleteNote(noteId);
        return ResponseEntity.ok(ApiResponse.ok("Note link deleted successfully", null));
    }

    @DeleteMapping("/notes/{noteId}")
    @Operation(summary = "Delete note link (alias)")
    public ResponseEntity<ApiResponse<Void>> deleteNoteAlias(@PathVariable Long noteId) {
        subjectService.deleteNote(noteId);
        return ResponseEntity.ok(ApiResponse.ok("Note link deleted successfully", null));
    }

    @PostMapping("/questions")
    @Operation(summary = "Create a new question")
    public ResponseEntity<ApiResponse<Question>> createQuestion(@Valid @RequestBody QuestionCreateRequest req) {
        Question created = questionService.createQuestion(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Question created", created));
    }

    @PutMapping("/questions/{id}")
    @Operation(summary = "Update an existing question")
    public ResponseEntity<ApiResponse<Question>> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionCreateRequest req) {
        Question updated = questionService.updateQuestion(id, req);
        return ResponseEntity.ok(ApiResponse.ok("Question updated", updated));
    }

    @DeleteMapping("/questions/{id}")
    @Operation(summary = "Delete question")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.ok("Question deleted successfully", null));
    }
}
