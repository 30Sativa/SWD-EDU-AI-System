using EduAISystem.Application.Features.Lessons.DTOs.Request;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.Commands
{
    public record CreateLessonCommand(CreateLessonRequestDto Request) : IRequest
    {
    }
}
