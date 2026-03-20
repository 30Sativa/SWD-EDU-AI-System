using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class QuizAttemptRepository : IQuizAttemptRepository
    {
        private readonly EduAiDbV5Context _context;

        public QuizAttemptRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        // =============================================
        // WRITE
        // =============================================

        public async Task<QuizAttemptDomain> CreateAsync(QuizAttemptDomain attempt, CancellationToken cancellationToken)
        {
            var entity = new QuizAttempt
            {
                Id = attempt.Id,
                StudentId = attempt.StudentId,
                QuizId = attempt.QuizId,
                Status = attempt.Status,
                StartedAt = attempt.StartedAt
            };

            _context.QuizAttempts.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return attempt;
        }

        public async Task UpdateAsync(QuizAttemptDomain attempt, CancellationToken cancellationToken)
        {
            var entity = await _context.QuizAttempts
                .FirstOrDefaultAsync(a => a.Id == attempt.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"QuizAttempt {attempt.Id} không tồn tại.");

            entity.Status = attempt.Status;
            entity.Score = attempt.Score;
            entity.MaxScore = attempt.MaxScore;
            entity.Percentage = attempt.Percentage;
            entity.IsPassed = attempt.IsPassed;
            entity.SubmittedAt = attempt.SubmittedAt;
            entity.TimeSpent = attempt.TimeSpent;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task SaveAnswersAsync(Guid attemptId, List<AttemptAnswerDomain> answers, CancellationToken cancellationToken)
        {
            var entities = answers.Select(a => new AttemptAnswer
            {
                Id = a.Id,
                AttemptId = attemptId,
                QuestionId = a.QuestionId,
                AnswerText = a.AnswerText,
                SelectedOptionId = a.SelectedOptionId,
                IsCorrect = a.IsCorrect,
                PointsEarned = a.PointsEarned
            }).ToList();

            _context.AttemptAnswers.AddRange(entities);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // =============================================
        // READ
        // =============================================

        public async Task<QuizAttemptDomain?> GetByIdAsync(Guid attemptId, CancellationToken cancellationToken)
        {
            var entity = await _context.QuizAttempts
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == attemptId, cancellationToken);

            return entity is null ? null : MapToDomain(entity);
        }

        public async Task<QuizAttemptWithAnswersDomain?> GetWithAnswersAsync(Guid attemptId, CancellationToken cancellationToken)
        {
            var entity = await _context.QuizAttempts
                .AsNoTracking()
                .Include(a => a.AttemptAnswers)
                .Include(a => a.Quiz)
                    .ThenInclude(q => q.Questions.OrderBy(x => x.SortOrder))
                        .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.SortOrder))
                .FirstOrDefaultAsync(a => a.Id == attemptId, cancellationToken);

            if (entity is null) return null;

            var answers = entity.AttemptAnswers.Select(a => new AttemptAnswerDomain
            {
                Id = a.Id,
                AttemptId = a.AttemptId,
                QuestionId = a.QuestionId,
                AnswerText = a.AnswerText,
                SelectedOptionId = a.SelectedOptionId,
                IsCorrect = a.IsCorrect ?? false,
                PointsEarned = a.PointsEarned ?? 0m
            }).ToList();

            // Map quiz + questions
            var quizEntity = entity.Quiz;
            var questions = quizEntity.Questions.Select(q =>
            {
                var options = q.QuestionOptions
                    .Select(o => new QuestionOptionDomain(o.Id, o.QuestionId, o.OptionText, o.IsCorrect, o.SortOrder))
                    .ToList<QuestionOptionDomain>();

                return new QuestionDomain(q.Id, q.QuizId, q.Quiz?.LessonId, q.Quiz?.CourseId, q.QuestionText, q.QuestionType,
                    q.CorrectAnswer, q.Points ?? 1m, q.Explanation, q.SortOrder, options);
            }).ToList();

            return new QuizAttemptWithAnswersDomain
            {
                Attempt = MapToDomain(entity),
                Answers = answers,
                QuizDetail = new QuizWithQuestionsDomain
                {
                    Quiz = MapQuizToDomain(quizEntity),
                    Questions = questions
                }
            };
        }

        public async Task<QuizAttemptDomain?> GetActiveAttemptAsync(Guid quizId, Guid studentId, CancellationToken cancellationToken)
        {
            var entity = await _context.QuizAttempts
                .AsNoTracking()
                .FirstOrDefaultAsync(a =>
                    a.QuizId == quizId &&
                    a.StudentId == studentId &&
                    a.Status == "IN_PROGRESS", cancellationToken);

            return entity is null ? null : MapToDomain(entity);
        }

        public async Task<List<QuizAttemptDomain>> GetByStudentAndQuizAsync(Guid quizId, Guid studentId, CancellationToken cancellationToken)
        {
            return await _context.QuizAttempts
                .AsNoTracking()
                .Where(a => a.QuizId == quizId && a.StudentId == studentId)
                .OrderByDescending(a => a.StartedAt)
                .Select(a => MapToDomain(a))
                .ToListAsync(cancellationToken);
        }

        // =============================================
        // MAPPERS
        // =============================================

        private static QuizAttemptDomain MapToDomain(QuizAttempt entity) => new(
            id: entity.Id,
            studentId: entity.StudentId,
            quizId: entity.QuizId,
            status: entity.Status,
            score: entity.Score,
            maxScore: entity.MaxScore,
            percentage: entity.Percentage,
            isPassed: entity.IsPassed,
            startedAt: entity.StartedAt ?? DateTime.UtcNow,
            submittedAt: entity.SubmittedAt,
            timeSpent: entity.TimeSpent
        );

        private static QuizDomain MapQuizToDomain(Quiz q)
        {
            _ = Enum.TryParse<Domain.Enums.QuizTypeDomain>(q.QuizType, out var qt);
            return new QuizDomain(
                id: q.Id,
                lessonId: q.LessonId,
                courseId: q.CourseId,
                quizType: qt,
                title: q.Title,
                description: q.Description,
                timeLimit: q.TimeLimit,
                maxAttempts: q.MaxAttempts,
                passingScore: q.PassingScore,
                isPublished: q.IsPublished,
                isActive: q.IsActive,
                isRequired: q.IsRequired,
                showAnswers: q.ShowAnswers,
                shuffleQuestions: q.ShuffleQuestions,
                createdAt: q.CreatedAt,
                updatedAt: q.UpdatedAt
            );
        }
    }
}
