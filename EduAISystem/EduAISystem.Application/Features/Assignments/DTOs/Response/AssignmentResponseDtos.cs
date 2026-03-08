namespace EduAISystem.Application.Features.Assignments.DTOs.Response
{
    public record AssignmentSummaryResponseDto(
        Guid AssignmentId,
        Guid CourseId,
        string Title,
        string? Description,
        DateTime? DueDate,
        decimal? MaxScore,
        string Status,
        DateTime? CreatedAt,
        string? AllowedFileTypes = null,
        int? MaxFileSizeMB = null,
        bool? AllowTextSubmit = null,
        bool? AllowFileSubmit = null
    );
}

