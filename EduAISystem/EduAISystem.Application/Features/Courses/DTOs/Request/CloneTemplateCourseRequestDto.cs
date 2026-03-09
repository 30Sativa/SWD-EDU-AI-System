using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.DTOs.Request
{
    public  class CloneTemplateCourseRequestDto
    {
        public Guid TemplateId { get; set; }
        public Guid TeacherId { get; set; }
        public string NewCode { get; set; } = string.Empty;
    }
}
