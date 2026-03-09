using EduAISystem.Application.Features.Courses.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public record ScanTemplateCourseCommand(Guid CourseId,
    byte[] FileContent,
    string FileName,
    string ContentType) : IRequest<ScanTemplateCourseResponseDto>
    {
    }
}
