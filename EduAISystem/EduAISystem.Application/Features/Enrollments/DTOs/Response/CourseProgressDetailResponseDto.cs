using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Enrollments.DTOs.Response
{
    public class CourseProgressDetailResponseDto
    {
        public Guid CourseId { get; set; }

        public string CourseTitle { get; set; } = string.Empty;

        public decimal Progress { get; set; }

        public string Status { get; set; } = string.Empty;

        public int TotalLessons { get; set; }

        public int CompletedLessons { get; set; }

        public List<CourseSectionProgressResponseDto> Sections { get; set; } = new();
    }
}

