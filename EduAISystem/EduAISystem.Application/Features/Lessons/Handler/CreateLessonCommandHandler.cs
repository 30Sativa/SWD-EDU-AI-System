using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    public class CreateLessonCommandHandler : IRequestHandler<CreateLessonCommand>
    {
        private readonly ILessonRepository _lessonRepository; 
        public CreateLessonCommandHandler(ILessonRepository lessonRepository)
        {
            _lessonRepository = lessonRepository;
        }
        public async Task Handle(CreateLessonCommand request, CancellationToken cancellationToken)
        {
            var lesson = LessonDomain.Create(
                request.Request.SectionId,
                request.Request.Title,
                request.Request.Slug,
                request.Request.VideoUrl,
                request.Request.Content,
                request.Request.SortOrder,
                request.Request.Duration,
                request.Request.IsPreview);
            await _lessonRepository.AddAsync(lesson);
        }
    }
}
