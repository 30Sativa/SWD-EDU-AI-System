using EduAISystem.Application.Common.Models;

namespace EduAISystem.Application.Features.CourseCategories.DTOs.Request
{
    public class CourseCategoryListRequestDto : PagedRequest
    {
        public string? SearchTerm { get; set; }
        public bool? IsActiveFilter { get; set; }
        public Guid? ParentId { get; set; }
    }
}

