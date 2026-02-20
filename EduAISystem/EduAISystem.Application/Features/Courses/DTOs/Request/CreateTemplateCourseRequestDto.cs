using EduAISystem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.DTOs.Request
{
    public class CreateTemplateCourseRequestDto
    {
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public Guid? GradeLevelId { get; set; }
        public Guid? CategoryId { get; set; }
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public CourseLevelDomain Level { get; set; }
    }
}
