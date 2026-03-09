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

    // === Tài liệu đính kèm ===
    public string? MaterialUrl { get; set; }    // Link file PDF/PPTX/DOCX
    public string? MaterialType { get; set; }   // "PDF", "PPTX", "DOCX"

    // === Loại video ===
    public string? VideoType { get; set; }      // "Link" (YouTube/external) hoặc "File" (upload lên cloud)

    // === Kiểm soát AI ===
    public bool? CanUseAI { get; set; }                  // Bật/tắt AI cho lesson này
    public string? AIProcessingStatus { get; set; }      // "None", "Pending", "Completed"

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
