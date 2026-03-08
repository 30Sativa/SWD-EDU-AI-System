using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Enrollments.DTOs.Response
{
    public class CourseSectionProgressResponseDto
    {
        public Guid SectionId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int Order { get; set; }

        public List<CourseLessonProgressResponseDto> Lessons { get; set; } = new();
    }
}

