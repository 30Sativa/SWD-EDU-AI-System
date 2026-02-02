using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class LoginAttempt
{
    public Guid Id { get; set; }

    public string? Email { get; set; }

    public Guid? UserId { get; set; }

    public string? IpAddress { get; set; }

    public bool IsSuccess { get; set; }

    public string? FailureReason { get; set; }

    public DateTime? AttemptAt { get; set; }

    public virtual User? User { get; set; }
}
