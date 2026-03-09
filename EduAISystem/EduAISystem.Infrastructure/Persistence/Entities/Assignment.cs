using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Assignment
{
    public Guid Id { get; set; }

    public Guid CourseId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public decimal? MaxScore { get; set; }

    public bool? IsPublished { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // === Cấu hình nộp bài ===
    public string? AllowedFileTypes { get; set; }  // "PDF,DOCX,JPG" hoặc null = mọi loại
    public int? MaxFileSizeMB { get; set; }          // Giới hạn dung lượng file (MB), mặc định 10
    public bool? AllowTextSubmit { get; set; }     // Cho phép nộp bằng text
    public bool? AllowFileSubmit { get; set; }     // Cho phép nộp bằng file upload

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
