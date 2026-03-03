namespace EduAISystem.Application.Features.Assignments.DTOs.Request
{
    public record CreateAssignmentRequestDto(
        Guid CourseId,
        string Title,
        string? Description,
        DateTime? DueDate,
        decimal? MaxScore,
        bool Publish
    );

    public record UpdateAssignmentRequestDto(
        string? Title,
        string? Description,
        DateTime? DueDate,
        decimal? MaxScore
    );
}

