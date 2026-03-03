using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    /// <summary>
    /// Repository để quản lý Quiz Attempt của Student.
    /// Dùng chung cho cả Flow 1 (Formative) và Flow 2 (Summative).
    /// </summary>
    public interface IQuizAttemptRepository
    {
        // =============================================
        // WRITE
        // =============================================

        /// <summary>Tạo Attempt mới khi Student bắt đầu làm bài.</summary>
        Task<QuizAttemptDomain> CreateAsync(QuizAttemptDomain attempt, CancellationToken cancellationToken);

        /// <summary>Cập nhật Attempt sau khi Submit (Grade, Score, Status → GRADED).</summary>
        Task UpdateAsync(QuizAttemptDomain attempt, CancellationToken cancellationToken);

        /// <summary>Lưu danh sách câu trả lời của Student vào DB.</summary>
        Task SaveAnswersAsync(Guid attemptId, List<AttemptAnswerDomain> answers, CancellationToken cancellationToken);

        // =============================================
        // READ
        // =============================================

        /// <summary>Lấy Attempt theo Id (không kèm answers).</summary>
        Task<QuizAttemptDomain?> GetByIdAsync(Guid attemptId, CancellationToken cancellationToken);

        /// <summary>Lấy Attempt kèm tất cả AttemptAnswers — dùng khi xem kết quả.</summary>
        Task<QuizAttemptWithAnswersDomain?> GetWithAnswersAsync(Guid attemptId, CancellationToken cancellationToken);

        /// <summary>
        /// Lấy Attempt đang IN_PROGRESS của Student cho quiz cụ thể.
        /// Dùng để validate "không làm 2 bài cùng lúc".
        /// </summary>
        Task<QuizAttemptDomain?> GetActiveAttemptAsync(Guid quizId, Guid studentId, CancellationToken cancellationToken);

        /// <summary>Lấy tất cả Attempts của Student cho một Quiz (lịch sử làm bài).</summary>
        Task<List<QuizAttemptDomain>> GetByStudentAndQuizAsync(Guid quizId, Guid studentId, CancellationToken cancellationToken);
    }

    // =============================================
    // Supporting domain types dùng trong Repository
    // =============================================

    public class AttemptAnswerDomain
    {
        public Guid Id { get; init; } = Guid.NewGuid();
        public Guid AttemptId { get; init; }
        public Guid QuestionId { get; init; }
        public string? AnswerText { get; init; }
        public Guid? SelectedOptionId { get; init; }
        public bool IsCorrect { get; init; }
        public decimal PointsEarned { get; init; }
    }

    public class QuizAttemptWithAnswersDomain
    {
        public QuizAttemptDomain Attempt { get; init; } = null!;
        public List<AttemptAnswerDomain> Answers { get; init; } = [];
        public QuizWithQuestionsDomain QuizDetail { get; init; } = null!;
    }
}
