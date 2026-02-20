using EduAISystem.Application.Features.Courses.DTOs.Request;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public record CreateTemplateCourseCommand(CreateTemplateCourseRequestDto Request) : IRequest<Guid>
    {
    }
}
