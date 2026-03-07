using EduAISystem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.DTOs.Response
{
    public class LessonResponseDto
    {
        public Guid Id { get; set; }
        public Guid SectionId { get; set; }

        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;

        public string? VideoUrl { get; set; }
        public string? Content { get; set; }

        // Thông tin tài liệu đính kèm (PDF/DOCX/PPTX, video upload)
        public string? MaterialUrl { get; set; }
        public string? MaterialType { get; set; }
        public string? VideoType { get; set; }

        // Cấu hình AI cho bài học
        public bool? CanUseAI { get; set; }
        public string? AIProcessingStatus { get; set; }

        public int SortOrder { get; set; }
        public int? Duration { get; set; }

        public string? Status { get; set; }
        public bool? IsPreview { get; set; }

        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }

    }
}
