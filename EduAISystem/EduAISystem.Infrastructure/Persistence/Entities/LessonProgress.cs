using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class LessonProgress
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }

    public Guid LessonId { get; set; }

    public bool? IsCompleted { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime? LastAccessedAt { get; set; }

    public int? WatchedDuration { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
