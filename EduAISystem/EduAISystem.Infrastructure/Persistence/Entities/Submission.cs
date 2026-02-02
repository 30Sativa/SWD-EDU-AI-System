using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Submission
{
    public Guid Id { get; set; }

    public Guid AssignmentId { get; set; }

    public Guid StudentId { get; set; }

    public string? Content { get; set; }

    public string? FileUrl { get; set; }

    public decimal? Score { get; set; }

    public string? Feedback { get; set; }

    public string? Status { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public DateTime? GradedAt { get; set; }

    public virtual Assignment Assignment { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
