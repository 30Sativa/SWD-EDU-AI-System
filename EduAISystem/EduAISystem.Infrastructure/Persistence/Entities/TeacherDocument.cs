using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class TeacherDocument
{
    public Guid Id { get; set; }

    public Guid TeacherId { get; set; }

    public string FileName { get; set; } = null!;

    public string FileUrl { get; set; } = null!;

    public long? FileSize { get; set; }

    public string? FileType { get; set; }

    public int? PageCount { get; set; }

    public string? ExtractedText { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? ProcessingStartedAt { get; set; }

    public DateTime? ProcessingCompletedAt { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AilessonDraft> AilessonDrafts { get; set; } = new List<AilessonDraft>();

    public virtual Teacher Teacher { get; set; } = null!;
}
