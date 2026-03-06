using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

/// <summary>
/// Một khối nội dung trong Lesson.
/// BlockType hợp lệ: 'Concept' | 'Example' | 'Exercise' | 'Reflection'
/// Có thể tạo thủ công (Manual) hoặc sinh tự động bởi AI (IsAiGenerated = true).
/// </summary>
public partial class LessonBlock
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    /// <summary>
    /// Loại block sư phạm: 'Concept', 'Example', 'Exercise', 'Reflection'
    /// </summary>
    public string BlockType { get; set; } = null!;

    /// <summary>Nội dung của block (NVARCHAR(MAX))</summary>
    public string Content { get; set; } = null!;

    public int SortOrder { get; set; }

    public bool? IsRequired { get; set; }

    public int? EstimatedMinutes { get; set; }

    // === AI Metadata (optional – null nếu tạo thủ công) ===

    /// <summary>True nếu nội dung được sinh bởi AI; False/null nếu giáo viên tự nhập.</summary>
    public bool? IsAiGenerated { get; set; }

    /// <summary>Nguồn đầu vào AI dùng để sinh block: 'Text' | 'PDF' | 'File'</summary>
    public string? AiSourceType { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;
}
