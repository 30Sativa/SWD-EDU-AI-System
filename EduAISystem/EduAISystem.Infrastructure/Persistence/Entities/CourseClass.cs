using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class CourseClass
{
    public Guid CourseId { get; set; }

    public Guid ClassId { get; set; }

    public DateTime? AssignedAt { get; set; }

    public virtual Class Class { get; set; } = null!;

    public virtual Course Course { get; set; } = null!;
}
