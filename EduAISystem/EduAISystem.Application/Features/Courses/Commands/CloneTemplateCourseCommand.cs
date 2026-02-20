using EduAISystem.Application.Features.Courses.DTOs.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public record CloneTemplateCourseCommand(CloneTemplateCourseRequestDto Request) : MediatR.IRequest<Guid>
    {
    }
}
