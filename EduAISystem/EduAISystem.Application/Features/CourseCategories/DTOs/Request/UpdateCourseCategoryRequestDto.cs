using System.Text.Json.Serialization;
using EduAISystem.Application.Common.JsonConverters;

namespace EduAISystem.Application.Features.CourseCategories.DTOs.Request
{
    public class UpdateCourseCategoryRequestDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }

        [JsonConverter(typeof(NullableGuidJsonConverter))]
        public Guid? ParentId { get; set; }
        public string? IconUrl { get; set; }
        public int? SortOrder { get; set; }
    }
}

