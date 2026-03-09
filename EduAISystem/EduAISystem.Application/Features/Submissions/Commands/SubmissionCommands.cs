using EduAISystem.Application.Features.Submissions.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Submissions.Commands
{
    public record SubmitAssignmentCommand(Guid AssignmentId, SubmitAssignmentRequestDto Request) : IRequest<Guid>;

    public record GradeSubmissionCommand(Guid SubmissionId, GradeSubmissionRequestDto Request) : IRequest<Guid>;
}

