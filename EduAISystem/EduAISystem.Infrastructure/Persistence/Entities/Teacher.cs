using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Teacher
{
    public Guid UserId { get; set; }

    public string? Bio { get; set; }

    public int? ExperienceYears { get; set; }

    public bool? Verified { get; set; }

    public decimal? Rating { get; set; }

    public int? TotalStudents { get; set; }

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<TeacherDocument> TeacherDocuments { get; set; } = new List<TeacherDocument>();

    public virtual User User { get; set; } = null!;
}
