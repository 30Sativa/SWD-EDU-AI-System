using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class StudentQuestion
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }

    public Guid LessonId { get; set; }

    public string QuestionText { get; set; } = null!;

    public string? Airesponse { get; set; }

    public bool? IsAnswered { get; set; }

    public DateTime? AnsweredAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public Guid? ConversationId { get; set; }

    public Guid? ParentQuestionId { get; set; }

    public int? PromptTokens { get; set; }

    public int? CompletionTokens { get; set; }

    public string? ModelUsed { get; set; }

    public string? Provider { get; set; }

    public int? LatencyMs { get; set; }

    public string? Status { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
