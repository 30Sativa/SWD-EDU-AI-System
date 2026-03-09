using EduAISystem.Domain.Enums;

namespace EduAISystem.Application.Features.Courses.DTOs.Request
{
    public class UpdateCourseRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public CourseLevelDomain Level { get; set; }
        public string? Language { get; set; }
    }
}
