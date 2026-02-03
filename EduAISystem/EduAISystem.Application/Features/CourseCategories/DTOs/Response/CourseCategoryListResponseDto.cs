namespace EduAISystem.Application.Features.CourseCategories.DTOs.Response
{
    public class CourseCategoryListResponseDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Slug { get; init; } = string.Empty;
        public Guid? ParentId { get; init; }
        public string? ParentName { get; init; }
        public int SortOrder { get; init; }
        public bool IsActive { get; init; }
    }
}

