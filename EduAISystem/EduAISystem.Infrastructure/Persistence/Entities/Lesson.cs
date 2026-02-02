using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Lesson
{
    public Guid Id { get; set; }

    public Guid SectionId { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? VideoUrl { get; set; }

    public string? Content { get; set; }

    public int SortOrder { get; set; }

    public int? Duration { get; set; }

    public string? Status { get; set; }

    public bool? IsPreview { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<LessonBlock> LessonBlocks { get; set; } = new List<LessonBlock>();

    public virtual ICollection<LessonFaq> LessonFaqs { get; set; } = new List<LessonFaq>();

    public virtual ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();

    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();

    public virtual Section Section { get; set; } = null!;

    public virtual ICollection<StudentQuestion> StudentQuestions { get; set; } = new List<StudentQuestion>();
}
