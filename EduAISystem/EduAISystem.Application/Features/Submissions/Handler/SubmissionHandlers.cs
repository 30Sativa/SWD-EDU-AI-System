using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Submissions.Commands;
using EduAISystem.Application.Features.Submissions.DTOs.Response;
using EduAISystem.Application.Features.Submissions.Queries;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Submissions.Handler
{
    public class SubmitAssignmentCommandHandler
        : IRequestHandler<SubmitAssignmentCommand, Guid>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly ISubmissionRepository _submissionRepository;
        private readonly ICurrentUserService _currentUser;
        private readonly ILessonProgressRepository _lessonProgressRepository;

        public SubmitAssignmentCommandHandler(
            IAssignmentRepository assignmentRepository,
            ISubmissionRepository submissionRepository,
            ICurrentUserService currentUser,
            ILessonProgressRepository lessonProgressRepository)
        {
            _assignmentRepository = assignmentRepository;
            _submissionRepository = submissionRepository;
            _currentUser = currentUser;
            _lessonProgressRepository = lessonProgressRepository;
        }

        public async Task<Guid> Handle(SubmitAssignmentCommand request, CancellationToken cancellationToken)
        {
            var studentId = _currentUser.UserId;
            if (studentId == Guid.Empty)
            {
                throw new UnauthorizedException("Bạn cần đăng nhập để nộp bài.");
            }

            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId, cancellationToken)
                ?? throw new NotFoundException($"Assignment {request.AssignmentId} không tồn tại.");

            if (assignment.Status.ToString() != "Published")
            {
                throw new BusinessException("Assignment chưa được publish, không thể nộp bài.");
            }

            // TODO: có thể enforce deadline, late-submission rule sau (THPT: cho phép nộp trễ, flag riêng)

            var dto = request.Request;

            var existing = await _submissionRepository
                .GetLatestByStudentAsync(request.AssignmentId, studentId, cancellationToken);

            if (existing is null)
            {
                var submission = SubmissionDomain.CreateDraft(
                    request.AssignmentId,
                    studentId,
                    dto.Content,
                    dto.FileUrl,
                    dto.FileName,
                    dto.FileSize,
                    dto.FileType);

                await _submissionRepository.CreateAsync(submission, cancellationToken);
                await _lessonProgressRepository.UpdateCourseProgressAsync(studentId, assignment.CourseId, cancellationToken);
                return submission.Id;
            }
            else
            {
                existing.Resubmit(dto.Content, dto.FileUrl, dto.FileName, dto.FileSize, dto.FileType);
                await _submissionRepository.UpdateAsync(existing, cancellationToken);
                await _lessonProgressRepository.UpdateCourseProgressAsync(studentId, assignment.CourseId, cancellationToken);
                return existing.Id;
            }
        }
    }

    public class GradeSubmissionCommandHandler
        : IRequestHandler<GradeSubmissionCommand, Guid>
    {
        private readonly ISubmissionRepository _submissionRepository;

        public GradeSubmissionCommandHandler(ISubmissionRepository submissionRepository)
        {
            _submissionRepository = submissionRepository;
        }

        public async Task<Guid> Handle(GradeSubmissionCommand request, CancellationToken cancellationToken)
        {
            var submission = await _submissionRepository.GetByIdAsync(request.SubmissionId, cancellationToken)
                ?? throw new NotFoundException($"Submission {request.SubmissionId} không tồn tại.");

            var dto = request.Request;

            submission.Grade(dto.Score, dto.Feedback);
            await _submissionRepository.UpdateAsync(submission, cancellationToken);

            return submission.Id;
        }
    }

    public class GetSubmissionsByAssignmentQueryHandler
        : IRequestHandler<GetSubmissionsByAssignmentQuery, List<SubmissionSummaryResponseDto>>
    {
        private readonly ISubmissionRepository _submissionRepository;

        public GetSubmissionsByAssignmentQueryHandler(ISubmissionRepository submissionRepository)
        {
            _submissionRepository = submissionRepository;
        }

        public async Task<List<SubmissionSummaryResponseDto>> Handle(
            GetSubmissionsByAssignmentQuery request,
            CancellationToken cancellationToken)
        {
            var submissions = await _submissionRepository
                .GetByAssignmentAsync(request.AssignmentId, cancellationToken);

            return submissions
                .Select(s => new SubmissionSummaryResponseDto(
                    s.Id,
                    s.AssignmentId,
                    s.StudentId,
                    s.Score,
                    s.Feedback,
                    s.Status.ToString(),
                    s.SubmittedAt,
                    s.GradedAt))
                .ToList();
        }
    }

    public class GetMySubmissionForAssignmentQueryHandler
        : IRequestHandler<GetMySubmissionForAssignmentQuery, SubmissionSummaryResponseDto?>
    {
        private readonly ISubmissionRepository _submissionRepository;
        private readonly ICurrentUserService _currentUser;

        public GetMySubmissionForAssignmentQueryHandler(
            ISubmissionRepository submissionRepository,
            ICurrentUserService currentUser)
        {
            _submissionRepository = submissionRepository;
            _currentUser = currentUser;
        }

        public async Task<SubmissionSummaryResponseDto?> Handle(
            GetMySubmissionForAssignmentQuery request,
            CancellationToken cancellationToken)
        {
            var studentId = _currentUser.UserId;
            if (studentId == Guid.Empty)
            {
                throw new UnauthorizedException("Bạn cần đăng nhập để xem bài nộp.");
            }

            var submission = await _submissionRepository
                .GetLatestByStudentAsync(request.AssignmentId, studentId, cancellationToken);

            if (submission is null)
            {
                return null;
            }

            return new SubmissionSummaryResponseDto(
                submission.Id,
                submission.AssignmentId,
                submission.StudentId,
                submission.Score,
                submission.Feedback,
                submission.Status.ToString(),
                submission.SubmittedAt,
                submission.GradedAt);
        }
    }
}

