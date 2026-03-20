using EduAISystem.Application.Features.Quiz.DTOs.Response;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IQuizRepository
    {
        // =============================================
        // WRITE
        // =============================================
        Task CreateAsync(QuizDomain quiz, CancellationToken cancellationToken);
        Task UpdateAsync(QuizDomain quiz, CancellationToken cancellationToken);
        Task DeleteAsync(QuizDomain quiz, CancellationToken cancellationToken);
        Task AddQuestionsAsync(Guid quizId, List<QuestionDomain> questions, CancellationToken cancellationToken);
        Task UpdateQuestionAsync(QuestionDomain question, CancellationToken cancellationToken);
        Task DeleteQuestionAsync(Guid quizId, Guid questionId, CancellationToken cancellationToken);
        Task UpdateQuestionOptionAsync(Guid questionId, QuestionOptionDomain option, CancellationToken cancellationToken);
        Task DeleteQuestionOptionAsync(Guid questionId, Guid optionId, CancellationToken cancellationToken);

        // =============================================
        // READ — Quiz info
        // =============================================
        Task<QuizDomain?> GetByIdAsync(Guid quizId, CancellationToken cancellationToken);

        /// <summary>
        /// Lấy Quiz kèm danh sách Question + Options — dùng khi Student bắt đầu làm bài.
        /// </summary>
        Task<QuizWithQuestionsDomain?> GetWithQuestionsAsync(Guid quizId, CancellationToken cancellationToken);

        Task<List<QuestionDomain>> GetQuestionsByIdsAsync(IEnumerable<Guid> questionIds, CancellationToken cancellationToken);

        Task<List<QuestionOptionDomain>> GetQuestionOptionsAsync(Guid questionId, CancellationToken cancellationToken);

        // =============================================
        // READ — Theo context
        // =============================================

        /// <summary>Flow 1: Lấy tất cả Formative Quiz của một Lesson.</summary>
        Task<List<QuizDomain>> GetByLessonIdAsync(Guid lessonId, CancellationToken cancellationToken);

        /// <summary>Flow 2: Lấy tất cả Summative Quiz của một Course.</summary>
        Task<List<QuizDomain>> GetByCourseIdAsync(Guid courseId, CancellationToken cancellationToken);

        Task<List<QuestionDomain>> GetQuestionBankAsync(Guid? courseId, Guid? lessonId, Guid? teacherId, CancellationToken cancellationToken);
        Task<List<QuestionBankSummaryResponseDto>> GetQuestionBankSummaryAsync(Guid? teacherId, CancellationToken cancellationToken);

        // =============================================
        // BUSINESS RULE SUPPORT
        // =============================================

        /// <summary>Đếm số lần Student đã làm quiz (bất kể trạng thái).</summary>
        Task<int> CountAttemptsAsync(Guid quizId, Guid studentId, CancellationToken cancellationToken);
    }

    /// <summary>DTO nội bộ dùng khi load Quiz kèm câu hỏi (không expose ra ngoài API trực tiếp).</summary>
    public class QuizWithQuestionsDomain
    {
        public QuizDomain Quiz { get; init; } = null!;
        public List<QuestionDomain> Questions { get; init; } = [];
        public Guid? TeacherId { get; init; }
    }
}
