using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class AilessonDraftBlock
{
    public Guid Id { get; set; }

    public Guid DraftLessonId { get; set; }

    public string? BlockType { get; set; }

    public double? ConfidenceScore { get; set; }

    public bool? IsEditedByTeacher { get; set; }

    public string? OriginalContent { get; set; }

    public string? Content { get; set; }

    public int? SortOrder { get; set; }

    public virtual AilessonDraft DraftLesson { get; set; } = null!;
}
