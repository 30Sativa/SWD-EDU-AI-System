namespace EduAISystem.Application.Features.Courses.DTOs.Response
{
    public class CourseListItemResponseDto
    {
        public Guid Id { get; init; }
        public string Code { get; init; } = string.Empty;
        public string Title { get; init; } = string.Empty;
        public string? Thumbnail { get; init; }

        public Guid SubjectId { get; init; }
        public string SubjectName { get; init; } = string.Empty;

        public int EnrollmentCount { get; init; }
        public decimal Rating { get; init; }
        public int ReviewCount { get; init; }

        public string Status { get; init; } = string.Empty;
        public bool IsActive { get; init; }

        public DateTime CreatedAt { get; init; }
    }
}

