using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Notification
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Type { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string? Link { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
