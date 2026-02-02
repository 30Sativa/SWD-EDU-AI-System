using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class LessonBlock
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    public string BlockType { get; set; } = null!;

    public string Content { get; set; } = null!;

    public int SortOrder { get; set; }

    public bool? IsRequired { get; set; }

    public int? EstimatedMinutes { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;
}
