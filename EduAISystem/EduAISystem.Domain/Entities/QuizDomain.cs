namespace EduAISystem.Domain.Entities
{
    public class QuizDomain
    {
        public Guid Id { get; private set; }
        public Guid LessonId { get; private set; } 
        public string Title { get; private set; } = null!;

        public string? Description { get; private set; }

        public int? TimeLimit { get; private set; }

        public int? MaxAttempts { get; private set; }

        public decimal? PassingScore { get; private set; }

        public bool? IsPublished { get; private set; }

        public bool? IsActive { get; private set; }

        public bool? IsRequired { get; private set; }

        public bool? ShowAnswers { get; private set; }

        public bool? ShuffleQuestions { get; private set; }

        public DateTime? CreatedAt { get; private set; }

        public DateTime? UpdatedAt { get; private set; }

        public QuizDomain()
        {
            
        }

        public QuizDomain(Guid id, Guid lessonId, string title, string? description, int? timeLimit, int? maxAttempts, decimal? passingScore, bool? isPublished, bool? isActive, bool? isRequired, bool? showAnswers, bool? shuffleQuestions, DateTime? createdAt, DateTime? updatedAt)
        {
            Id = id;
            LessonId = lessonId;
            Title = title;
            Description = description;
            TimeLimit = timeLimit;
            MaxAttempts = maxAttempts;
            PassingScore = passingScore;
            IsPublished = isPublished;
            IsActive = isActive;
            IsRequired = isRequired;
            ShowAnswers = showAnswers;
            ShuffleQuestions = shuffleQuestions;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
        }

        public static QuizDomain Create(Guid lessonId, string title, string? description = null, int? timeLimit = null, int? maxAttempts = null, decimal? passingScore = null, bool? isPublished = null, bool? isActive = null, bool? isRequired = null, bool? showAnswers = null, bool? shuffleQuestions = null)
        {
            return new QuizDomain
            {
                Id = Guid.NewGuid(),
                LessonId = lessonId,
                Title = title,
                Description = description,
                TimeLimit = timeLimit,
                MaxAttempts = maxAttempts,
                PassingScore = passingScore,
                IsPublished = isPublished,
                IsActive = true,
                IsRequired = isRequired,
                ShowAnswers = showAnswers,
                ShuffleQuestions = shuffleQuestions,
                CreatedAt = DateTime.UtcNow
            };
        }

        public static QuizDomain Update(QuizDomain quiz, string? title = null, string? description = null, int? timeLimit = null, int? maxAttempts = null, decimal? passingScore = null, bool? isPublished = null, bool? isActive = null, bool? isRequired = null, bool? showAnswers = null, bool? shuffleQuestions = null)
        {
            quiz.Title = title ?? quiz.Title;
            quiz.Description = description ?? quiz.Description;
            quiz.TimeLimit = timeLimit ?? quiz.TimeLimit;
            quiz.MaxAttempts = maxAttempts ?? quiz.MaxAttempts;
            quiz.PassingScore = passingScore ?? quiz.PassingScore;
            quiz.IsPublished = isPublished ?? quiz.IsPublished;
            quiz.IsActive = isActive ?? quiz.IsActive;
            quiz.IsRequired = isRequired ?? quiz.IsRequired;
            quiz.ShowAnswers = showAnswers ?? quiz.ShowAnswers;
            quiz.ShuffleQuestions = shuffleQuestions ?? quiz.ShuffleQuestions;
            quiz.UpdatedAt = DateTime.UtcNow;
            return quiz;
        }

        public static QuizDomain Delete(QuizDomain quiz)
        {
            quiz.IsActive = false;
            quiz.UpdatedAt = DateTime.UtcNow;
            return quiz;
        }
    }
}
