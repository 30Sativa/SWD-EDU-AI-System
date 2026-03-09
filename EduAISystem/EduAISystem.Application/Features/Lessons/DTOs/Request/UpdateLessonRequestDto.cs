using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.DTOs.Request
{
    public class UpdateLessonRequestDto
    {
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string? VideoUrl { get; set; }
        public string? VideoType { get; set; } // "Link" or "File"
        public string? Content { get; set; }
        public string? MaterialUrl { get; set; }
        public string? MaterialType { get; set; }
        public bool? CanUseAI { get; set; }
        public string? AIProcessingStatus { get; set; }
        public int SortOrder { get; set; }
        public int? Duration { get; set; }
        public string? Status { get; set; }
        public bool? IsPreview { get; set; }
        public bool? IsActive { get; set; }
    }
}
