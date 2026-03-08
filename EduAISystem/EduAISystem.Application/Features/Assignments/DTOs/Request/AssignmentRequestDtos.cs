namespace EduAISystem.Application.Features.Assignments.DTOs.Request
{
    public record CreateAssignmentRequestDto(
        Guid CourseId,
        string Title,
        string? Description,
        DateTime? DueDate,
        decimal? MaxScore,
        bool Publish,
        string? AllowedFileTypes = null,
        int? MaxFileSizeMB = null,
        bool? AllowTextSubmit = null,
        bool? AllowFileSubmit = null
    );

    public record UpdateAssignmentRequestDto(
        string? Title,
        string? Description,
        DateTime? DueDate,
        decimal? MaxScore,
        string? AllowedFileTypes = null,
        int? MaxFileSizeMB = null,
        bool? AllowTextSubmit = null,
        bool? AllowFileSubmit = null
    );
}

