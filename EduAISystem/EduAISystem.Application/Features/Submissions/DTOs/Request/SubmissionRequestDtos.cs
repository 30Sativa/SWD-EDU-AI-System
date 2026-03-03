namespace EduAISystem.Application.Features.Submissions.DTOs.Request
{
    public record SubmitAssignmentRequestDto(
        string? Content,
        string? FileUrl
    );

    public record GradeSubmissionRequestDto(
        decimal? Score,
        string? Feedback
    );
}

