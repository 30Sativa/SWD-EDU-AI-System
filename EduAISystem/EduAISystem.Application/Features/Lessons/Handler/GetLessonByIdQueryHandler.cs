using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Application.Features.Lessons.Queries;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    public class GetLessonByIdQueryHandler : IRequestHandler<GetLessonByIdQuery, LessonResponseDto>
    {
        private readonly ILessonRepository _lessonRepository;

        public GetLessonByIdQueryHandler(ILessonRepository lessonRepository)
        {
            _lessonRepository = lessonRepository;
        }

        public async Task<LessonResponseDto> Handle(GetLessonByIdQuery request, CancellationToken cancellationToken)
        {
            var lesson = await _lessonRepository.GetByIdAsync(request.LessonId)
                ?? throw new NotFoundException("Lesson không tồn tại");

            return new LessonResponseDto
            {
                Id = lesson.Id,
                SectionId = lesson.SectionId,
                Title = lesson.Title,
                Slug = lesson.Slug,
                VideoUrl = lesson.VideoUrl,
                Content = lesson.Content,
                MaterialUrl = lesson.MaterialUrl,
                MaterialType = lesson.MaterialType,
                VideoType = lesson.VideoType,
                CanUseAI = lesson.CanUseAI,
                AIProcessingStatus = lesson.AIProcessingStatus,
                SortOrder = lesson.SortOrder,
                Duration = lesson.Duration,
                Status = lesson.Status.ToString(),
                IsPreview = lesson.IsPreview,
                IsActive = lesson.IsActive,
                CreatedAt = lesson.CreatedAt
            };
        }
    }
}

