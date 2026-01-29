using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class LessonFaq
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    public string? Question { get; set; }

    public string? Answer { get; set; }

    public int? SortOrder { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;
}
