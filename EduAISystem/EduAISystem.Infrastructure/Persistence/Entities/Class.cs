using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Class
{
    public Guid Id { get; set; }

    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public Guid? TeacherId { get; set; }

    public Guid? TermId { get; set; }

    public Guid? GradeLevelId { get; set; }

    public int? MaxStudents { get; set; }

    public int? CurrentStudents { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<CourseClass> CourseClasses { get; set; } = new List<CourseClass>();

    public virtual GradeLevel? GradeLevel { get; set; }

    public virtual ICollection<StudentClass> StudentClasses { get; set; } = new List<StudentClass>();

    public virtual Teacher? Teacher { get; set; }

    public virtual Term? Term { get; set; }
}
