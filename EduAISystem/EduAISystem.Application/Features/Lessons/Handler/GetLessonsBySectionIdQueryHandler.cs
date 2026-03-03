using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Application.Features.Lessons.Queries;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    public class GetLessonsBySectionIdQueryHandler : IRequestHandler<GetLessonsBySectionIdQuery, List<LessonResponseDto>>
    {
        private readonly ILessonRepository _lessonRepository;

        public GetLessonsBySectionIdQueryHandler(ILessonRepository lessonRepository)
        {
            _lessonRepository = lessonRepository;
        }

        public async Task<List<LessonResponseDto>> Handle(GetLessonsBySectionIdQuery request, CancellationToken cancellationToken)
        {
            var lessons = await _lessonRepository.GetBySectionIdAsync(request.SectionId);

            return lessons.Select(l => new LessonResponseDto
            {
                Id = l.Id,
                SectionId = l.SectionId,
                Title = l.Title,
                Slug = l.Slug,
                VideoUrl = l.VideoUrl,
                Content = l.Content,
                SortOrder = l.SortOrder,
                Duration = l.Duration,
                Status = l.Status.ToString(),
                IsPreview = l.IsPreview,
                IsActive = l.IsActive,
                CreatedAt = l.CreatedAt
            }).ToList();
        }
    }
}

