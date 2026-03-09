namespace EduAISystem.Application.Features.CourseCategories.DTOs.Response
{
    public class CourseCategoryDetailResponseDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Slug { get; init; } = string.Empty;
        public string? Description { get; init; }
        public Guid? ParentId { get; init; }
        public string? ParentName { get; init; }
        public string? IconUrl { get; init; }
        public int SortOrder { get; init; }
        public bool IsActive { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? UpdatedAt { get; init; }
    }
}

