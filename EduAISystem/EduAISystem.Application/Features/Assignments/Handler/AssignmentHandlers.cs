using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Assignments.Commands;
using EduAISystem.Application.Features.Assignments.DTOs.Request;
using EduAISystem.Application.Features.Assignments.DTOs.Response;
using EduAISystem.Application.Features.Assignments.Queries;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using MediatR;

namespace EduAISystem.Application.Features.Assignments.Handler
{
    public class CreateAssignmentCommandHandler
        : IRequestHandler<CreateAssignmentCommand, Guid>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly INotificationService _notificationService;

        public CreateAssignmentCommandHandler(
            ICourseRepository courseRepository,
            IAssignmentRepository assignmentRepository,
            INotificationService notificationService)
        {
            _courseRepository = courseRepository;
            _assignmentRepository = assignmentRepository;
            _notificationService = notificationService;
        }

        public async Task<Guid> Handle(CreateAssignmentCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var course = await _courseRepository.GetByIdAsync(dto.CourseId, cancellationToken)
                ?? throw new NotFoundException($"Course {dto.CourseId} không tồn tại.");

            var assignment = AssignmentDomain.Create(
                dto.CourseId,
                dto.Title,
                dto.Description,
                dto.DueDate,
                dto.MaxScore,
                dto.Publish,
                dto.AllowedFileTypes,
                dto.MaxFileSizeMB,
                dto.AllowTextSubmit,
                dto.AllowFileSubmit);

            await _assignmentRepository.CreateAsync(assignment, cancellationToken);

            if (dto.Publish == true)
            {
                var studentIds = await _courseRepository.GetStudentIdsByCourseClassesAsync(course.Id, cancellationToken);
                if (studentIds.Any())
                {
                    await _notificationService.SendBatchNotificationAsync(
                        studentIds,
                        NotificationTypeDomain.System,
                        "Bài tập mới",
                        $"Giáo viên đã thêm bài tập mới: '{assignment.Title}' trong khóa học '{course.Title}'.",
                        $"/student/assignments/{assignment.Id}",
                        cancellationToken);
                }
            }

            return assignment.Id;
        }
    }

    public class UpdateAssignmentCommandHandler
        : IRequestHandler<UpdateAssignmentCommand, Guid>
    {
        private readonly IAssignmentRepository _assignmentRepository;

        public UpdateAssignmentCommandHandler(IAssignmentRepository assignmentRepository)
        {
            _assignmentRepository = assignmentRepository;
        }

        public async Task<Guid> Handle(UpdateAssignmentCommand request, CancellationToken cancellationToken)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId, cancellationToken)
                ?? throw new NotFoundException($"Assignment {request.AssignmentId} không tồn tại.");

            var dto = request.Request;

            assignment.Update(
                dto.Title,
                dto.Description,
                dto.DueDate,
                dto.MaxScore,
                dto.AllowedFileTypes,
                dto.MaxFileSizeMB,
                dto.AllowTextSubmit,
                dto.AllowFileSubmit);

            await _assignmentRepository.UpdateAsync(assignment, cancellationToken);
            return assignment.Id;
        }
    }

    public class DeleteAssignmentCommandHandler
        : IRequestHandler<DeleteAssignmentCommand, Unit>
    {
        private readonly IAssignmentRepository _assignmentRepository;

        public DeleteAssignmentCommandHandler(IAssignmentRepository assignmentRepository)
        {
            _assignmentRepository = assignmentRepository;
        }

        public async Task<Unit> Handle(DeleteAssignmentCommand request, CancellationToken cancellationToken)
        {
            await _assignmentRepository.DeleteAsync(request.AssignmentId, cancellationToken);
            return Unit.Value;
        }
    }

    public class PublishAssignmentCommandHandler
        : IRequestHandler<PublishAssignmentCommand, Guid>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly INotificationService _notificationService;

        public PublishAssignmentCommandHandler(
            IAssignmentRepository assignmentRepository,
            ICourseRepository courseRepository,
            INotificationService notificationService)
        {
            _assignmentRepository = assignmentRepository;
            _courseRepository = courseRepository;
            _notificationService = notificationService;
        }

        public async Task<Guid> Handle(PublishAssignmentCommand request, CancellationToken cancellationToken)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId, cancellationToken)
                ?? throw new NotFoundException($"Assignment {request.AssignmentId} không tồn tại.");

            assignment.Publish();
            await _assignmentRepository.UpdateAsync(assignment, cancellationToken);

            var course = await _courseRepository.GetByIdAsync(assignment.CourseId, cancellationToken);
            var studentIds = await _courseRepository.GetStudentIdsByCourseClassesAsync(assignment.CourseId, cancellationToken);
            
            if (studentIds.Any())
            {
                await _notificationService.SendBatchNotificationAsync(
                    studentIds,
                    NotificationTypeDomain.System,
                    "Bài tập mới",
                    $"Giáo viên đã thêm bài tập mới: '{assignment.Title}' trong khóa học '{course?.Title}'.",
                    $"/student/assignments/{assignment.Id}",
                    cancellationToken);
            }

            return assignment.Id;
        }
    }

    public class UnpublishAssignmentCommandHandler
        : IRequestHandler<UnpublishAssignmentCommand, Guid>
    {
        private readonly IAssignmentRepository _assignmentRepository;

        public UnpublishAssignmentCommandHandler(IAssignmentRepository assignmentRepository)
        {
            _assignmentRepository = assignmentRepository;
        }

        public async Task<Guid> Handle(UnpublishAssignmentCommand request, CancellationToken cancellationToken)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId, cancellationToken)
                ?? throw new NotFoundException($"Assignment {request.AssignmentId} không tồn tại.");

            assignment.Unpublish();
            await _assignmentRepository.UpdateAsync(assignment, cancellationToken);
            return assignment.Id;
        }
    }

    public class GetAssignmentsByCourseForTeacherQueryHandler
        : IRequestHandler<GetAssignmentsByCourseForTeacherQuery, List<AssignmentSummaryResponseDto>>
    {
        private readonly IAssignmentRepository _assignmentRepository;

        public GetAssignmentsByCourseForTeacherQueryHandler(IAssignmentRepository assignmentRepository)
        {
            _assignmentRepository = assignmentRepository;
        }

        public async Task<List<AssignmentSummaryResponseDto>> Handle(
            GetAssignmentsByCourseForTeacherQuery request,
            CancellationToken cancellationToken)
        {
            var assignments = await _assignmentRepository
                .GetByCourseForTeacherAsync(request.CourseId, cancellationToken);

            return assignments
                .Select(a => new AssignmentSummaryResponseDto(
                    a.Id,
                    a.CourseId,
                    a.Title,
                    a.Description,
                    a.DueDate,
                    a.MaxScore ?? 0m,
                    a.Status.ToString(),
                    a.CreatedAt,
                    a.AllowedFileTypes,
                    a.MaxFileSizeMB,
                    a.AllowTextSubmit,
                    a.AllowFileSubmit))
                .ToList();
        }
    }

    public class GetAssignmentsByCourseForStudentQueryHandler
        : IRequestHandler<GetAssignmentsByCourseForStudentQuery, List<AssignmentSummaryResponseDto>>
    {
        private readonly IAssignmentRepository _assignmentRepository;

        public GetAssignmentsByCourseForStudentQueryHandler(IAssignmentRepository assignmentRepository)
        {
            _assignmentRepository = assignmentRepository;
        }

        public async Task<List<AssignmentSummaryResponseDto>> Handle(
            GetAssignmentsByCourseForStudentQuery request,
            CancellationToken cancellationToken)
        {
            var assignments = await _assignmentRepository
                .GetPublishedByCourseForStudentAsync(request.CourseId, cancellationToken);

            return assignments
                .Select(a => new AssignmentSummaryResponseDto(
                    a.Id,
                    a.CourseId,
                    a.Title,
                    a.Description,
                    a.DueDate,
                    a.MaxScore ?? 0m,
                    a.Status.ToString(),
                    a.CreatedAt,
                    a.AllowedFileTypes,
                    a.MaxFileSizeMB,
                    a.AllowTextSubmit,
                    a.AllowFileSubmit))
                .ToList();
        }
    }
}

