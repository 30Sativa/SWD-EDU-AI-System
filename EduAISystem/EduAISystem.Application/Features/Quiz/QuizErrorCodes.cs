namespace EduAISystem.Application.Features.Quiz;

/// <summary>
/// Mã lỗi cho Quiz/Question/Option — FE dùng để hiển thị hoặc xử lý theo logic.
/// </summary>
public static class QuizErrorCodes
{
    // Quiz
    public const string QUIZ_NOT_FOUND = "QUIZ_NOT_FOUND";
    public const string QUIZ_INACTIVE = "QUIZ_INACTIVE";

    // Question
    public const string QUESTION_NOT_FOUND = "QUESTION_NOT_FOUND";
    public const string QUESTION_NOT_IN_QUIZ = "QUESTION_NOT_IN_QUIZ";
    public const string QUESTION_TEXT_REQUIRED = "QUESTION_TEXT_REQUIRED";
    public const string QUESTION_TYPE_INVALID = "QUESTION_TYPE_INVALID";
    public const string QUESTION_POINTS_INVALID = "QUESTION_POINTS_INVALID";
    public const string QUESTION_OPTIONS_INVALID = "QUESTION_OPTIONS_INVALID";
    public const string QUESTION_OPTION_ID_NOT_FOUND = "QUESTION_OPTION_ID_NOT_FOUND";

    // Option
    public const string OPTION_NOT_FOUND = "OPTION_NOT_FOUND";
    public const string OPTION_NOT_IN_QUESTION = "OPTION_NOT_IN_QUESTION";
    public const string OPTION_HAS_ATTEMPTS = "OPTION_HAS_ATTEMPTS"; // FK: AttemptAnswers.SelectedOptionId
    public const string OPTION_TEXT_REQUIRED = "OPTION_TEXT_REQUIRED";

    // DB / Concurrency
    public const string DB_UPDATE_CONCURRENCY = "DB_UPDATE_CONCURRENCY";
    public const string DB_FK_VIOLATION = "DB_FK_VIOLATION";
}
