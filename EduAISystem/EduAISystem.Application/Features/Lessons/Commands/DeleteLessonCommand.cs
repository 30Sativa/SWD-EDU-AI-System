using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.Commands
{
    public record DeleteLessonCommand(Guid LessonId) : IRequest
    {
    }
}
