using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Lessons.Queries
{
    public record GetLessonsBySectionIdQuery(Guid SectionId) : IRequest<List<LessonResponseDto>>
    {
    }
}

