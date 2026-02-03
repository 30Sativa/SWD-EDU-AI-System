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
        public string Title { get; set; } = null!;
        public string slug { get; set; } = null!;
        public string? VideoUrl { get; set; }
        public string? Content { get; set; }
        public int SortOrder { get; set; }
        public int? Duration { get; set; } 
        public LessonStatusDomain Status { get; set; }
        public int IsPreview { get; set; }

    }
}
