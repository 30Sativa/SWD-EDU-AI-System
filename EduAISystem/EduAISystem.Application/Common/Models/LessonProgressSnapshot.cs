using System;

namespace EduAISystem.Application.Common.Models
{
    /// <summary>
    /// Lightweight snapshot of a student's progress for a specific lesson.
    /// Used by query handlers to enrich course outline with progress data.
    /// </summary>
    public class LessonProgressSnapshot
    {
        public Guid LessonId { get; set; }

        public bool IsCompleted { get; set; }

        public int WatchedDuration { get; set; }

        public DateTime? LastAccessedAt { get; set; }
    }
}

