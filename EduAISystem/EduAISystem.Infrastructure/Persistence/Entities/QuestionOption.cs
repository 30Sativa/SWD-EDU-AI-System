using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class QuestionOption
{
    public Guid Id { get; set; }

    public Guid QuestionId { get; set; }

    public string OptionText { get; set; } = null!;

    public bool? IsCorrect { get; set; }

    public int SortOrder { get; set; }

    public virtual ICollection<AttemptAnswer> AttemptAnswers { get; set; } = new List<AttemptAnswer>();

    public virtual Question Question { get; set; } = null!;
}
