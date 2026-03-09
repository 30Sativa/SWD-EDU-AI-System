namespace EduAISystem.Application.Features.Quiz.DTOs.Response
{
    // =============================================
    // Danh sách Quiz (summary)
    // =============================================
    public record QuizSummaryResponseDto(
        Guid QuizId,
        string Title,
        string? Description,
        string QuizType,
        int? TimeLimit,
        int? MaxAttempts,
        decimal? PassingScore,
        bool? IsPublished,
        bool? IsRequired,
        bool? ShowAnswers,
        bool? ShuffleQuestions,
        DateTime? CreatedAt
    );

    // =============================================
    // Chi tiết Quiz + Câu hỏi (cho Student làm bài)
    // NOTE: KHÔNG bao gồm IsCorrect / CorrectAnswer
    // =============================================
    public record QuizDetailResponseDto(
        Guid QuizId,
        string Title,
        string? Description,
        string QuizType,
        int? TimeLimit,
        int? MaxAttempts,
        int AttemptsUsed,             // Số lần Student đã làm
        decimal? PassingScore,
        bool? ShuffleQuestions,
        List<QuestionResponseDto> Questions
    );

    public record QuestionResponseDto(
        Guid QuestionId,
        string QuestionText,
        string QuestionType,
        decimal Points,
        int SortOrder,
        List<OptionResponseDto> Options   // KHÔNG có IsCorrect
    );

    public record OptionResponseDto(
        Guid OptionId,
        string OptionText,
        int SortOrder
    );

    public record OptionDetailResponseDto(
        Guid OptionId,
        string OptionText,
        bool? IsCorrect,
        int SortOrder
    );

    // =============================================
    // Teacher — Chi tiết câu hỏi (bao gồm đáp án đúng)
    // =============================================
    public record TeacherQuestionDetailResponseDto(
        Guid QuestionId,
        Guid QuizId,
        string QuestionText,
        string QuestionType,
        decimal Points,
        int SortOrder,
        string? Explanation,
        string? CorrectAnswer,
        List<OptionDetailResponseDto> Options
    );

    // =============================================
    // Kết quả sau khi nộp bài (AttemptResult)
    // =============================================
    public record AttemptResultResponseDto(
        Guid AttemptId,
        Guid QuizId,
        string QuizTitle,
        string Status,
        decimal Score,
        decimal MaxScore,
        decimal Percentage,
        bool IsPassed,
        decimal PassingScore,
        DateTime StartedAt,
        DateTime? SubmittedAt,
        int? TimeSpent,
        List<QuestionResultDto> Questions   // Chi tiết từng câu
    );

    public record QuestionResultDto(
        Guid QuestionId,
        string QuestionText,
        string QuestionType,
        decimal Points,
        Guid? SelectedOptionId,
        string? SelectedOptionText,
        bool IsCorrect,
        decimal PointsEarned,
        // Chỉ hiện khi Quiz.ShowAnswers = true
        string? CorrectOptionText,
        string? Explanation
    );

    // =============================================
    // Start Attempt Response
    // =============================================
    public record StartAttemptResponseDto(
        Guid AttemptId,
        Guid QuizId,
        string Status,
        DateTime StartedAt,
        int? TimeLimitSeconds        // null = không giới hạn thời gian
    );

    // =============================================
    // Submit Response (nhanh)
    // =============================================
    public record SubmitAttemptResponseDto(
        Guid AttemptId,
        string Status,
        decimal Score,
        decimal MaxScore,
        decimal Percentage,
        bool IsPassed
    );
}
