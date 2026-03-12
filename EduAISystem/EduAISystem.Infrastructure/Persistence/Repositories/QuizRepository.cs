using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Quiz;
using EduAISystem.Application.Features.Quiz.DTOs.Response;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class QuizRepository : IQuizRepository
    {
        private readonly EduAiDbV5Context _context;

        public QuizRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        // =============================================
        // WRITE
        // =============================================

        public async Task CreateAsync(QuizDomain quiz, CancellationToken cancellationToken)
        {
            var entity = MapToEntity(quiz);
            _context.Quizzes.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(QuizDomain quiz, CancellationToken cancellationToken)
        {
            var entity = await _context.Quizzes
                .FirstOrDefaultAsync(q => q.Id == quiz.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Quiz {quiz.Id} không tồn tại.");

            entity.Title = quiz.Title;
            entity.Description = quiz.Description;
            entity.TimeLimit = quiz.TimeLimit;
            entity.MaxAttempts = quiz.MaxAttempts;
            entity.PassingScore = quiz.PassingScore;
            entity.IsPublished = quiz.IsPublished;
            entity.IsActive = quiz.IsActive;
            entity.IsRequired = quiz.IsRequired;
            entity.ShowAnswers = quiz.ShowAnswers;
            entity.ShuffleQuestions = quiz.ShuffleQuestions;
            entity.UpdatedAt = quiz.UpdatedAt;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(QuizDomain quiz, CancellationToken cancellationToken)
        {
            var entity = await _context.Quizzes
                .FirstOrDefaultAsync(q => q.Id == quiz.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Quiz {quiz.Id} không tồn tại.");

            entity.IsActive = false;
            entity.UpdatedAt = quiz.UpdatedAt;
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task AddQuestionsAsync(Guid quizId, List<QuestionDomain> questions, CancellationToken cancellationToken)
        {
            var entities = questions.Select(q => new Question
            {
                Id = q.Id,
                QuizId = quizId,
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType,
                CorrectAnswer = q.CorrectAnswer,
                Points = q.Points,
                Explanation = q.Explanation,
                SortOrder = q.SortOrder,
                QuestionOptions = q.Options.Select(o => new QuestionOption
                {
                    Id = o.Id,
                    QuestionId = q.Id,
                    OptionText = o.OptionText,
                    IsCorrect = o.IsCorrect,
                    SortOrder = o.SortOrder
                }).ToList()
            }).ToList();

            _context.Questions.AddRange(entities);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateQuestionAsync(QuestionDomain question, CancellationToken cancellationToken)
        {
            var entity = await _context.Questions
                .Include(q => q.QuestionOptions)
                .FirstOrDefaultAsync(q => q.Id == question.Id && q.QuizId == question.QuizId, cancellationToken)
                ?? throw new NotFoundException($"Câu hỏi không tồn tại.", QuizErrorCodes.QUESTION_NOT_FOUND);

            entity.QuestionText = question.QuestionText;
            entity.QuestionType = question.QuestionType;
            entity.CorrectAnswer = question.CorrectAnswer;
            entity.Points = question.Points;
            entity.Explanation = question.Explanation;
            entity.SortOrder = question.SortOrder;

            var existingOptions = entity.QuestionOptions.ToDictionary(o => o.Id);
            var incomingOptions = question.Options.ToDictionary(o => o.Id);

            foreach (var opt in question.Options)
            {
                if (existingOptions.TryGetValue(opt.Id, out var optEntity))
                {
                    optEntity.OptionText = opt.OptionText;
                    optEntity.IsCorrect = opt.IsCorrect;
                    optEntity.SortOrder = opt.SortOrder;
                }
                else
                {
                    entity.QuestionOptions.Add(new QuestionOption
                    {
                        Id = opt.Id,
                        QuestionId = entity.Id,
                        OptionText = opt.OptionText,
                        IsCorrect = opt.IsCorrect,
                        SortOrder = opt.SortOrder
                    });
                }
            }

            // Merge mode: KHÔNG xóa option — tránh DbUpdateConcurrencyException và FK với AttemptAnswer.
            // Option muốn xóa phải gọi DELETE /questions/{questionId}/options/{optionId} riêng.
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteQuestionAsync(Guid quizId, Guid questionId, CancellationToken cancellationToken)
        {
            var entity = await _context.Questions
                .Include(q => q.QuestionOptions)
                .FirstOrDefaultAsync(q => q.Id == questionId && q.QuizId == quizId, cancellationToken)
                ?? throw new NotFoundException($"Câu hỏi không tồn tại trong quiz này.", QuizErrorCodes.QUESTION_NOT_IN_QUIZ);

            _context.QuestionOptions.RemoveRange(entity.QuestionOptions);
            _context.Questions.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateQuestionOptionAsync(Guid questionId, QuestionOptionDomain option, CancellationToken cancellationToken)
        {
            var entity = await _context.QuestionOptions
                .FirstOrDefaultAsync(o => o.Id == option.Id && o.QuestionId == questionId, cancellationToken)
                ?? throw new NotFoundException($"Option không tồn tại trong câu hỏi này.", QuizErrorCodes.OPTION_NOT_IN_QUESTION);

            entity.OptionText = option.OptionText;
            entity.IsCorrect = option.IsCorrect;
            entity.SortOrder = option.SortOrder;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteQuestionOptionAsync(Guid questionId, Guid optionId, CancellationToken cancellationToken)
        {
            var entity = await _context.QuestionOptions
                .FirstOrDefaultAsync(o => o.Id == optionId && o.QuestionId == questionId, cancellationToken)
                ?? throw new NotFoundException($"Option không tồn tại hoặc không thuộc câu hỏi này.", QuizErrorCodes.OPTION_NOT_IN_QUESTION);

            _context.QuestionOptions.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // =============================================
        // READ — Quiz info
        // =============================================

        public async Task<QuizDomain?> GetByIdAsync(Guid quizId, CancellationToken cancellationToken)
        {
            var entity = await _context.Quizzes
                .AsNoTracking()
                .FirstOrDefaultAsync(q => q.Id == quizId && q.IsActive == true, cancellationToken);

            return entity is null ? null : MapToDomain(entity);
        }

        public async Task<QuizWithQuestionsDomain?> GetWithQuestionsAsync(Guid quizId, CancellationToken cancellationToken)
        {
            var entity = await _context.Quizzes
                .AsNoTracking()
                .Include(q => q.Course) // Flow 2
                .Include(q => q.Lesson) // Flow 1
                    .ThenInclude(l => l!.Section)
                        .ThenInclude(s => s.Course)
                .Include(q => q.Questions.OrderBy(x => x.SortOrder))
                    .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.SortOrder))
                .FirstOrDefaultAsync(q => q.Id == quizId && q.IsActive == true, cancellationToken);

            if (entity is null) return null;

            var questions = entity.Questions.Select(MapQuestionToDomain).ToList();

            // Lấy TeacherId dựa trên Flow (Course hoặc Lesson -> Section -> Course)
            Guid? teacherId = entity.Course?.TeacherId ?? entity.Lesson?.Section?.Course?.TeacherId;

            return new QuizWithQuestionsDomain
            {
                Quiz = MapToDomain(entity),
                Questions = questions,
                TeacherId = teacherId
            };
        }

        // =============================================
        // READ — Theo context
        // =============================================

        public async Task<List<QuestionDomain>> GetQuestionsByIdsAsync(IEnumerable<Guid> questionIds, CancellationToken cancellationToken)
        {
            var entities = await _context.Questions
                .AsNoTracking()
                .Include(q => q.QuestionOptions.OrderBy(o => o.SortOrder))
                .Where(q => questionIds.Contains(q.Id))
                .ToListAsync(cancellationToken);

            return entities.Select(MapQuestionToDomain).ToList();
        }

        public async Task<List<QuestionOptionDomain>> GetQuestionOptionsAsync(Guid questionId, CancellationToken cancellationToken)
        {
            var options = await _context.QuestionOptions
                .AsNoTracking()
                .Where(o => o.QuestionId == questionId)
                .OrderBy(o => o.SortOrder)
                .ToListAsync(cancellationToken);

            return options.Select(o => new QuestionOptionDomain(
                id: o.Id,
                questionId: o.QuestionId,
                optionText: o.OptionText,
                isCorrect: o.IsCorrect,
                sortOrder: o.SortOrder
            )).ToList();
        }


        public async Task<List<QuizDomain>> GetByLessonIdAsync(Guid lessonId, CancellationToken cancellationToken)
        {
            return await _context.Quizzes
                .AsNoTracking()
                .Where(q => q.LessonId == lessonId
                         && q.QuizType == "Formative"
                         && q.IsActive == true)
                .OrderBy(q => q.CreatedAt)
                .Select(q => MapToDomain(q))
                .ToListAsync(cancellationToken);
        }

        public async Task<List<QuizDomain>> GetByCourseIdAsync(Guid courseId, CancellationToken cancellationToken)
        {
            return await _context.Quizzes
                .AsNoTracking()
                .Where(q => q.CourseId == courseId
                         && q.QuizType == "Summative"
                         && q.IsActive == true)
                .OrderBy(q => q.CreatedAt)
                .Select(q => MapToDomain(q))
                .ToListAsync(cancellationToken);
        }

        public async Task<List<QuestionDomain>> GetQuestionBankAsync(Guid? courseId, Guid? lessonId, CancellationToken cancellationToken)
        {
            var query = _context.Questions
                .AsNoTracking()
                .Include(q => q.Quiz)
                .Include(q => q.QuestionOptions.OrderBy(o => o.SortOrder))
                .Where(q => q.Quiz.IsActive == true);

            if (lessonId.HasValue)
            {
                // Lấy các câu hỏi thuộc Quiz nằm trong Lesson này
                query = query.Where(q => q.Quiz.LessonId == lessonId.Value);
            }
            else if (courseId.HasValue)
            {
                // Lấy các câu hỏi thuộc Quiz nằm trong Course này (cả Summative trực tiếp và Formative thông qua Lesson)
                query = query.Where(q => q.Quiz.CourseId == courseId.Value || 
                                         (q.Quiz.Lesson != null && q.Quiz.Lesson.Section.CourseId == courseId.Value));
            }

            var entities = await query
                .OrderByDescending(q => q.Id)
                .Take(100)
                .ToListAsync(cancellationToken);

            return entities.Select(MapQuestionToDomain).ToList();
        }

        // =============================================
        // BUSINESS RULE SUPPORT
        // =============================================

        public async Task<int> CountAttemptsAsync(Guid quizId, Guid studentId, CancellationToken cancellationToken)
        {
            return await _context.QuizAttempts
                .CountAsync(a => a.QuizId == quizId && a.StudentId == studentId, cancellationToken);
        }

        public async Task<List<QuestionBankSummaryResponseDto>> GetQuestionBankSummaryAsync(Guid teacherId, CancellationToken cancellationToken)
        {
            // Lấy tất cả câu hỏi của giáo viên này, group theo Lesson
            var query = _context.Questions
                .AsNoTracking()
                .Include(q => q.Quiz)
                    .ThenInclude(z => z.Lesson)
                        .ThenInclude(l => l!.Section)
                            .ThenInclude(s => s.Course)
                .Include(q => q.Quiz)
                    .ThenInclude(z => z.Course)
                .Where(q => q.Quiz.IsActive == true && 
                           (q.Quiz.Course != null && q.Quiz.Course.TeacherId == teacherId || 
                            (q.Quiz.Lesson != null && q.Quiz.Lesson.Section != null && q.Quiz.Lesson.Section.Course != null && q.Quiz.Lesson.Section.Course.TeacherId == teacherId)));

            var questions = await query.ToListAsync(cancellationToken);

            // Grouping in memory (EF doesn't easily support complex grouping back to DTOs in this specific structure)
            var result = questions
                .GroupBy(q => new 
                { 
                    TopicId = q.Quiz.LessonId ?? q.Quiz.CourseId ?? Guid.Empty,
                    Name = q.Quiz.Lesson?.Title ?? q.Quiz.Course?.Title ?? "Chưa phân loại",
                    Code = q.Quiz.Lesson?.Slug ?? q.Quiz.Course?.Code ?? "QUIZ-BANK",
                    CourseName = q.Quiz.Course?.Title ?? q.Quiz.Lesson?.Section?.Course?.Title ?? "Khác",
                    Grade = "Lớp " + (q.Quiz.Course?.Level ?? q.Quiz.Lesson?.Section?.Course?.Level ?? "Hệ thống")
                })
                .Select(g => new QuestionBankSummaryResponseDto(
                    TopicId: g.Key.TopicId,
                    TopicName: g.Key.Name,
                    TopicCode: g.Key.Code,
                    CourseName: g.Key.CourseName,
                    Grade: g.Key.Grade,
                    TotalQuestions: g.Count(),
                    Stats: new DifficultyStatsDto(
                        Easy: g.Count(q => (q.Points ?? 1m) <= 1m),
                        Medium: g.Count(q => (q.Points ?? 1m) > 1m && (q.Points ?? 1m) < 3m),
                        Hard: g.Count(q => (q.Points ?? 1m) >= 3m)
                    ),
                    LastUpdated: g.Max(q => q.Quiz.UpdatedAt ?? q.Quiz.CreatedAt),
                    Status: "Sẵn sàng"
                ))
                .ToList();

            return result;
        }

        // =============================================
        // MAPPERS
        // =============================================

        private static Quiz MapToEntity(QuizDomain quiz) => new()
        {
            Id = quiz.Id,
            LessonId = quiz.LessonId,
            CourseId = quiz.CourseId,
            QuizType = quiz.QuizType.ToString(),
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

        private static QuizDomain MapToDomain(Quiz entity) => new(
            id: entity.Id,
            lessonId: entity.LessonId,
            courseId: entity.CourseId,
            quizType: Enum.TryParse<QuizTypeDomain>(entity.QuizType, out var qt) ? qt : QuizTypeDomain.Formative,
            title: entity.Title,
            description: entity.Description,
            timeLimit: entity.TimeLimit,
            maxAttempts: entity.MaxAttempts,
            passingScore: entity.PassingScore,
            isPublished: entity.IsPublished,
            isActive: entity.IsActive,
            isRequired: entity.IsRequired,
            showAnswers: entity.ShowAnswers,
            shuffleQuestions: entity.ShuffleQuestions,
            createdAt: entity.CreatedAt,
            updatedAt: entity.UpdatedAt
        );

        private static QuestionDomain MapQuestionToDomain(Question q)
        {
            var options = q.QuestionOptions
                .Select(o => new QuestionOptionDomain(
                    id: o.Id,
                    questionId: o.QuestionId,
                    optionText: o.OptionText,
                    isCorrect: o.IsCorrect,
                    sortOrder: o.SortOrder))
                .ToList();

            return new QuestionDomain(
                id: q.Id,
                quizId: q.QuizId,
                questionText: q.QuestionText,
                questionType: q.QuestionType,
                correctAnswer: q.CorrectAnswer,
                points: q.Points ?? 1m,
                explanation: q.Explanation,
                sortOrder: q.SortOrder,
                options: options
            );
        }
    }
}
