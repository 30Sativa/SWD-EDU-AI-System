using EduAISystem.Application.Features.Submissions.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Submissions.Queries
{
    public record GetSubmissionsByAssignmentQuery(Guid AssignmentId) : IRequest<List<SubmissionSummaryResponseDto>>;

    public record GetMySubmissionForAssignmentQuery(Guid AssignmentId) : IRequest<SubmissionSummaryResponseDto?>;
}

