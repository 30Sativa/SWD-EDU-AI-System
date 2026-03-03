using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Assignments.Commands;
using EduAISystem.Application.Features.Assignments.DTOs.Request;
using EduAISystem.Application.Features.Assignments.DTOs.Response;
using EduAISystem.Application.Features.Assignments.Queries;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Assignments.Handler
{
    public class CreateAssignmentCommandHandler
        : IRequestHandler<CreateAssignmentCommand, Guid>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IAssignmentRepository _assignmentRepository;

        public CreateAssignmentCommandHandler(
            ICourseRepository courseRepository,
            IAssignmentRepository assignmentRepository)
        {
            _courseRepository = courseRepository;
            _assignmentRepository = assignmentRepository;
        }

        public async Task<Guid> Handle(CreateAssignmentCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var course = await _courseRepository.GetByIdAsync(dto.CourseId, cancellationToken)
                ?? throw new NotFoundException($"Course {dto.CourseId} không tồn tại.");

            // Có thể bổ sung rule: chỉ teacher owner course mới tạo được assignment (sau này dùng ICurrentUserService)
            var assignment = AssignmentDomain.Create(
                dto.CourseId,
                dto.Title,
                dto.Description,
                dto.DueDate,
                dto.MaxScore,
                dto.Publish);

            await _assignmentRepository.CreateAsync(assignment, cancellationToken);
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
                dto.MaxScore);

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

        public PublishAssignmentCommandHandler(IAssignmentRepository assignmentRepository)
        {
            _assignmentRepository = assignmentRepository;
        }

        public async Task<Guid> Handle(PublishAssignmentCommand request, CancellationToken cancellationToken)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId, cancellationToken)
                ?? throw new NotFoundException($"Assignment {request.AssignmentId} không tồn tại.");

            assignment.Publish();
            await _assignmentRepository.UpdateAsync(assignment, cancellationToken);
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
                    a.CreatedAt))
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
                    a.CreatedAt))
                .ToList();
        }
    }
}

