namespace EduAISystem.Application.Features.Submissions.DTOs.Request
{
    public record SubmitAssignmentRequestDto(
        string? Content,
        string? FileUrl,
        string? FileName,
        long? FileSize,
        string? FileType
    );

    public record GradeSubmissionRequestDto(
        decimal? Score,
        string? Feedback
    );
}

