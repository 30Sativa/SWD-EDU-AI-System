namespace EduAISystem.Application.Features.AIReview.DTOs.Request
{
    public record AskAIRequestDto(
        Guid QuestionId,
        string StudentQuestionText
    );
}
