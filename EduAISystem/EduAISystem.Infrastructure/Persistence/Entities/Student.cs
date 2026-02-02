using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Student
{
    public Guid UserId { get; set; }

    public string? StudentCode { get; set; }

    public DateTime? EnrollmentDate { get; set; }

    public Guid? GradeLevelId { get; set; }

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual GradeLevel? GradeLevel { get; set; }

    public virtual ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();

    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();

    public virtual ICollection<StudentClass> StudentClasses { get; set; } = new List<StudentClass>();

    public virtual ICollection<StudentQuestion> StudentQuestions { get; set; } = new List<StudentQuestion>();

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    public virtual User User { get; set; } = null!;
}
