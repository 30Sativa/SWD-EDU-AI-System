using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Ailog
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public string? Feature { get; set; }

    public string? InputText { get; set; }

    public string? OutputText { get; set; }

    public int? TokensUsed { get; set; }

    public decimal? Cost { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? User { get; set; }
}
