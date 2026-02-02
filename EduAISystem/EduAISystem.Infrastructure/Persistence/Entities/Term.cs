using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Term
{
    public Guid Id { get; set; }

    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
}
