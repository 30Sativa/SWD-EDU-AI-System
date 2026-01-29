using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class StudentClass
{
    public Guid StudentId { get; set; }

    public Guid ClassId { get; set; }

    public DateTime? JoinedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual Class Class { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
