namespace EduAISystem.Application.Features.Submissions.DTOs.Response
{
    public record SubmissionSummaryResponseDto(
        Guid SubmissionId,
        Guid AssignmentId,
        Guid StudentId,
        decimal? Score,
        string? Feedback,
        string Status,
        DateTime? SubmittedAt,
        DateTime? GradedAt,
        string? FileUrl,
        string? FileName,
        long? FileSize,
        string? FileType
    );
}

