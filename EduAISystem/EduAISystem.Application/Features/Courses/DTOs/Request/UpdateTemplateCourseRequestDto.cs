using EduAISystem.Domain.Enums;
using System;

namespace EduAISystem.Application.Features.Courses.DTOs.Request
{
    public class UpdateTemplateCourseRequestDto
    {
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public Guid? GradeLevelId { get; set; }
        public Guid CategoryId { get; set; }
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public CourseLevelDomain Level { get; set; }
    }
}
