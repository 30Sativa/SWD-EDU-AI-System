using EduAISystem.Application.Features.Courses.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ICourseAiService 
    {
        Task<ScanTemplateCourseResponseDto> AnalyzeStructureAsync(string text);
    }
}
