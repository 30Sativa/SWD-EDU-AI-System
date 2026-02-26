using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Course
{
    public Guid Id { get; set; }

    public string Code { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public string? Thumbnail { get; set; }

    public Guid SubjectId { get; set; }

    public Guid? GradeLevelId { get; set; }

    public Guid? TeacherId { get; set; }

    public Guid? CategoryId { get; set; }

    public string? Level { get; set; }

    public string? Language { get; set; }

    public int? TotalLessons { get; set; }

    public int? TotalDuration { get; set; }

    public string? Status { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsFeatured { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public bool IsTemplate { get; set; }

    public Guid? SourceTemplateId { get; set; }
    public Guid CreatedByUserId { get; set; }   

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

    public virtual CourseCategory? Category { get; set; }

    public virtual ICollection<CourseClass> CourseClasses { get; set; } = new List<CourseClass>();

    public virtual CourseSetting? CourseSetting { get; set; }

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual GradeLevel? GradeLevel { get; set; }

    public virtual ICollection<Course> InverseSourceTemplate { get; set; } = new List<Course>();

    public virtual ICollection<Section> Sections { get; set; } = new List<Section>();

    public virtual Course? SourceTemplate { get; set; }

    public virtual Subject Subject { get; set; } = null!;

    public virtual Teacher? Teacher { get; set; }
    public virtual User CreatedByUser { get; set; }
}
