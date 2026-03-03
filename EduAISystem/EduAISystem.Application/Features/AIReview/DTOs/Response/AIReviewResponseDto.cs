namespace EduAISystem.Application.Features.AIReview.DTOs.Response
{
    public record AIReviewResponseDto(
        Guid StudentQuestionId,
        string QuestionText,
        string AIResponse,
        DateTime CreatedAt
    );
}
