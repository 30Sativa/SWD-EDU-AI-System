using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.Queries
{
    public record GetLessonByIdQuery(Guid LessonId) : IRequest<LessonResponseDto>
    {
    }
}
