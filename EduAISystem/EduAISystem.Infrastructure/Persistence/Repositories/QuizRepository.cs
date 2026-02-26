using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class QuizRepository : IQuizRepository
    {
        private readonly EduAiDbV5Context _context;

        public QuizRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task CreateAsync(QuizDomain quiz, CancellationToken cancellationToken)
        {
            var entity = new Quiz
            {
                Id = quiz.Id,
                LessonId = quiz.LessonId,
                Title = quiz.Title,
                Description = quiz.Description,
                TimeLimit = quiz.TimeLimit,
                MaxAttempts = quiz.MaxAttempts,
                PassingScore = quiz.PassingScore,
                IsPublished = quiz.IsPublished,
                IsActive = quiz.IsActive,
                IsRequired = quiz.IsRequired,
                ShowAnswers = quiz.ShowAnswers,
                ShuffleQuestions = quiz.ShuffleQuestions,
                CreatedAt = quiz.CreatedAt,
                UpdatedAt = quiz.UpdatedAt
            };
            
            _context.Quizzes.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
