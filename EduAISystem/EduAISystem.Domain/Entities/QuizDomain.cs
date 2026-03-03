using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    public class QuizDomain
    {
        public Guid Id { get; private set; }

        /// <summary>
        /// Flow 1 (Formative): bắt buộc có LessonId.
        /// Flow 2 (Summative): null.
        /// </summary>
        public Guid? LessonId { get; private set; }

        /// <summary>
        /// Flow 2 (Summative): bắt buộc có CourseId.
        /// Flow 1 (Formative): null.
        /// </summary>
        public Guid? CourseId { get; private set; }

        /// <summary>Formative = gắn Lesson | Summative = gắn Course</summary>
        public QuizTypeDomain QuizType { get; private set; } = QuizTypeDomain.Formative;

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

        public QuizDomain() { }

        // =============================================
        // REHYDRATE — dùng trong Repository để map từ DB
        // =============================================
        internal QuizDomain(
            Guid id,
            Guid? lessonId,
            Guid? courseId,
            QuizTypeDomain quizType,
            string title,
            string? description,
            int? timeLimit,
            int? maxAttempts,
            decimal? passingScore,
            bool? isPublished,
            bool? isActive,
            bool? isRequired,
            bool? showAnswers,
            bool? shuffleQuestions,
            DateTime? createdAt,
            DateTime? updatedAt)
        {
            Id = id;
            LessonId = lessonId;
            CourseId = courseId;
            QuizType = quizType;
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

        // =============================================
        // FLOW 1 — Formative Quiz (gắn với Lesson)
        // =============================================
        public static QuizDomain CreateFormative(
            Guid lessonId,
            string title,
            string? description = null,
            int? timeLimit = null,
            int? maxAttempts = null,
            decimal? passingScore = null,
            bool? isPublished = null,
            bool? isRequired = null,
            bool? showAnswers = null,
            bool? shuffleQuestions = null)
        {
            if (lessonId == Guid.Empty)
                throw new ArgumentException("LessonId là bắt buộc cho Formative Quiz.");
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Tiêu đề quiz không được để trống.");

            return new QuizDomain
            {
                Id = Guid.NewGuid(),
                LessonId = lessonId,
                CourseId = null,
                QuizType = QuizTypeDomain.Formative,
                Title = title.Trim(),
                Description = description,
                TimeLimit = timeLimit,
                MaxAttempts = maxAttempts ?? 3,
                PassingScore = passingScore ?? 70m,
                IsPublished = isPublished ?? false,
                IsActive = true,
                IsRequired = isRequired ?? true,
                ShowAnswers = showAnswers ?? true,
                ShuffleQuestions = shuffleQuestions ?? false,
                CreatedAt = DateTime.UtcNow
            };
        }

        // =============================================
        // FLOW 2 — Summative Quiz (gắn với Course)
        // =============================================
        public static QuizDomain CreateSummative(
            Guid courseId,
            string title,
            string? description = null,
            int? timeLimit = null,
            int? maxAttempts = null,
            decimal? passingScore = null,
            bool? isPublished = null,
            bool? isRequired = null,
            bool? showAnswers = null,
            bool? shuffleQuestions = null)
        {
            if (courseId == Guid.Empty)
                throw new ArgumentException("CourseId là bắt buộc cho Summative Quiz.");
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Tiêu đề quiz không được để trống.");

            return new QuizDomain
            {
                Id = Guid.NewGuid(),
                LessonId = null,
                CourseId = courseId,
                QuizType = QuizTypeDomain.Summative,
                Title = title.Trim(),
                Description = description,
                TimeLimit = timeLimit,
                MaxAttempts = maxAttempts ?? 1,   // Summative thường chỉ 1 lần
                PassingScore = passingScore ?? 70m,
                IsPublished = isPublished ?? false,
                IsActive = true,
                IsRequired = isRequired ?? true,
                ShowAnswers = showAnswers ?? false, // Summative thường không show đáp án
                ShuffleQuestions = shuffleQuestions ?? true,
                CreatedAt = DateTime.UtcNow
            };
        }

        // =============================================
        // CREATE — backward-compatible (alias Formative)
        // =============================================
        [Obsolete("Dùng CreateFormative hoặc CreateSummative thay thế.")]
        public static QuizDomain Create(
            Guid lessonId,
            string title,
            string? description = null,
            int? timeLimit = null,
            int? maxAttempts = null,
            decimal? passingScore = null,
            bool? isPublished = null,
            bool? isActive = null,
            bool? isRequired = null,
            bool? showAnswers = null,
            bool? shuffleQuestions = null)
            => CreateFormative(lessonId, title, description, timeLimit, maxAttempts,
                               passingScore, isPublished, isRequired, showAnswers, shuffleQuestions);

        // =============================================
        // UPDATE
        // =============================================
        public static QuizDomain Update(
            QuizDomain quiz,
            string? title = null,
            string? description = null,
            int? timeLimit = null,
            int? maxAttempts = null,
            decimal? passingScore = null,
            bool? isPublished = null,
            bool? isActive = null,
            bool? isRequired = null,
            bool? showAnswers = null,
            bool? shuffleQuestions = null)
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

        // =============================================
        // DELETE (soft)
        // =============================================
        public static QuizDomain Delete(QuizDomain quiz)
        {
            quiz.IsActive = false;
            quiz.UpdatedAt = DateTime.UtcNow;
            return quiz;
        }

        // =============================================
        // BUSINESS RULES
        // =============================================
        public bool IsFormative => QuizType == QuizTypeDomain.Formative;
        public bool IsSummative => QuizType == QuizTypeDomain.Summative;
    }
}
