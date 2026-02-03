namespace EduAISystem.Application.Features.CourseCategories.DTOs.Request
{
    public class CreateCourseCategoryRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? ParentId { get; set; }
        public string? IconUrl { get; set; }
        public int SortOrder { get; set; }
    }
}

