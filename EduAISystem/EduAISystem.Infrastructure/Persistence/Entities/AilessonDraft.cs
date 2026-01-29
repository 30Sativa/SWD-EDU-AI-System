using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class AilessonDraft
{
    public Guid Id { get; set; }

    public Guid DocumentId { get; set; }

    public string Title { get; set; } = null!;

    public string? PromptUsed { get; set; }

    public string? ModelUsed { get; set; }

    public double? Temperature { get; set; }

    public string Status { get; set; } = null!;

    public string? TeacherFeedback { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<AilessonDraftBlock> AilessonDraftBlocks { get; set; } = new List<AilessonDraftBlock>();

    public virtual TeacherDocument Document { get; set; } = null!;
}
