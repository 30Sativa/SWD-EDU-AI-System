using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class QuizAttempt
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }

    public Guid QuizId { get; set; }

    public decimal? Score { get; set; }

    public decimal? MaxScore { get; set; }

    public decimal? Percentage { get; set; }

    public bool? IsPassed { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public int? TimeSpent { get; set; }

    public virtual ICollection<AttemptAnswer> AttemptAnswers { get; set; } = new List<AttemptAnswer>();

    public virtual Quiz Quiz { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
