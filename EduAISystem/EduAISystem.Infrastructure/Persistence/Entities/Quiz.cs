namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Quiz
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public int? TimeLimit { get; set; }

    public int? MaxAttempts { get; set; }

    public decimal? PassingScore { get; set; }

    public bool? IsPublished { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsRequired { get; set; }

    public bool? ShowAnswers { get; set; }

    public bool? ShuffleQuestions { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;

    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();

    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
}
