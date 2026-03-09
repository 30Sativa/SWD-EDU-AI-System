using EduAISystem.Application.Features.Assignments.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Assignments.Commands
{
    public record CreateAssignmentCommand(CreateAssignmentRequestDto Request) : IRequest<Guid>;

    public record UpdateAssignmentCommand(Guid AssignmentId, UpdateAssignmentRequestDto Request) : IRequest<Guid>;

    public record DeleteAssignmentCommand(Guid AssignmentId) : IRequest<Unit>;

    public record PublishAssignmentCommand(Guid AssignmentId) : IRequest<Guid>;

    public record UnpublishAssignmentCommand(Guid AssignmentId) : IRequest<Guid>;
}

