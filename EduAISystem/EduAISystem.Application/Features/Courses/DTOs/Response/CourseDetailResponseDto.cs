namespace EduAISystem.Application.Features.Courses.DTOs.Response
{
    public class CourseDetailResponseDto
    {
        public Guid Id { get; init; }
        public string Code { get; init; } = string.Empty;
        public string Title { get; init; } = string.Empty;
        public string Slug { get; init; } = string.Empty;
        public string? Description { get; init; }
        public string? Thumbnail { get; init; }

        public Guid SubjectId { get; init; }
        public string SubjectName { get; init; } = string.Empty;

        public Guid? GradeLevelId { get; init; }
        public Guid TeacherId { get; init; }
        public Guid? CategoryId { get; init; }

        public string? Level { get; init; }
        public string? Language { get; init; }


        public int TotalLessons { get; init; }
        public int TotalDuration { get; init; }

        public string Status { get; init; } = string.Empty;
        public bool IsActive { get; init; }
        public bool IsFeatured { get; init; }

        public DateTime CreatedAt { get; init; }
        public DateTime? UpdatedAt { get; init; }
    }
}

