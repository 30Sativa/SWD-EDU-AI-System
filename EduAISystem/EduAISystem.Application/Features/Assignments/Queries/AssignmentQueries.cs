using EduAISystem.Application.Features.Assignments.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Assignments.Queries
{
    public record GetAssignmentsByCourseForTeacherQuery(Guid CourseId) : IRequest<List<AssignmentSummaryResponseDto>>;

    public record GetAssignmentsByCourseForStudentQuery(Guid CourseId) : IRequest<List<AssignmentSummaryResponseDto>>;
}

