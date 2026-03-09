using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.DTOs.Response
{
    public class ScanTemplateCourseResponseDto
    {
        public List<SectionScanDto> Sections { get; set; } = new();
    }

    public class SectionScanDto
    {
        public string Title { get; set; } = "";
        public int SortOrder { get; set; }
        public List<LessonScanDto> Lessons { get; set; } = new();
    }

    public class LessonScanDto
    {
        public string Title { get; set; } = "";
        public int SortOrder { get; set; }
    }
}
