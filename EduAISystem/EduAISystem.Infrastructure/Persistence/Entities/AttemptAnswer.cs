using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class AttemptAnswer
{
    public Guid Id { get; set; }

    public Guid AttemptId { get; set; }

    public Guid QuestionId { get; set; }

    public string? AnswerText { get; set; }

    public Guid? SelectedOptionId { get; set; }

    public bool? IsCorrect { get; set; }

    public decimal? PointsEarned { get; set; }

    public virtual QuizAttempt Attempt { get; set; } = null!;

    public virtual Question Question { get; set; } = null!;

    public virtual QuestionOption? SelectedOption { get; set; }
}
