using System;

namespace EduAISystem.Application.Features.Enrollments.DTOs.Response
{
    public class CourseLessonProgressResponseDto
    {
        public Guid LessonId { get; set; }

        public Guid SectionId { get; set; }

        public string Title { get; set; } = string.Empty;

        public int SortOrder { get; set; }

        public int? Duration { get; set; }

        public bool IsCompleted { get; set; }

        public int WatchedDuration { get; set; }

        public DateTime? LastAccessedAt { get; set; }
    }
}

