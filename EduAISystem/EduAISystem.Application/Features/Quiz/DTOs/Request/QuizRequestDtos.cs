namespace EduAISystem.Application.Features.Quiz.DTOs.Request
{
    // =============================================
    // Flow 1 — Teacher tạo Formative Quiz
    // =============================================
    public record CreateFormativeQuizRequestDto(
        Guid LessonId,
        string Title,
        string? Description,
        int? TimeLimit,
        int? MaxAttempts,
        decimal? PassingScore,
        bool? IsPublished,
        bool? IsRequired,
        bool? ShowAnswers,
        bool? ShuffleQuestions
    );

    // =============================================
    // Flow 2 — Teacher tạo Summative Quiz
    // =============================================
    public record CreateSummativeQuizRequestDto(
        Guid CourseId,
        string Title,
        string? Description,
        int? TimeLimit,
        int? MaxAttempts,
        decimal? PassingScore,
        bool? IsPublished,
        bool? IsRequired,
        bool? ShowAnswers,
        bool? ShuffleQuestions
    );

    // =============================================
    // Teacher thêm câu hỏi (Question & Options)
    // =============================================
    public record AddQuestionRequestDto(
        string QuestionText,
        string QuestionType, // "SINGLE_CHOICE", "MULTIPLE_CHOICE"
        decimal Points,
        string? Explanation,
        int SortOrder,
        List<AddOptionRequestDto> Options
    );

    public record AddOptionRequestDto(
        string OptionText,
        bool IsCorrect,
        int SortOrder
    );

    // =============================================
    // Teacher cập nhật Quiz & Question
    // =============================================

    public record UpdateQuizRequestDto(
        string? Title,
        string? Description,
        int? TimeLimit,
        int? MaxAttempts,
        decimal? PassingScore,
        bool? IsPublished,
        bool? IsRequired,
        bool? ShowAnswers,
        bool? ShuffleQuestions
    );

    public record UpdateQuestionRequestDto(
        string QuestionText,
        string QuestionType,
        decimal Points,
        string? Explanation,
        int SortOrder,
        List<UpdateOptionRequestDto> Options
    );

    public record UpdateOptionRequestDto(
        Guid? OptionId,
        string OptionText,
        bool IsCorrect,
        int SortOrder
    );

    // =============================================
    // Student nộp bài (Submit)
    // =============================================
    public record SubmitAttemptRequestDto(
        int? TimeSpentSeconds,
        List<AnswerItemDto> Answers
    );

    public record AnswerItemDto(
        Guid QuestionId,
        Guid? SelectedOptionId,
        string? AnswerText // Dành cho câu tự luận/điền khuyết sau này
    );
}
