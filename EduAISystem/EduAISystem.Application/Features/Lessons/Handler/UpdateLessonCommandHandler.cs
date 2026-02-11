using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Lessons.Commands;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    public class UpdateLessonCommandHandler : IRequestHandler<UpdateLessonCommand>
    {
        private readonly ILessonRepository _lessonRepository;
        public UpdateLessonCommandHandler(ILessonRepository lessonRepository)
        {
            _lessonRepository = lessonRepository;
        }
        public async Task Handle(UpdateLessonCommand request, CancellationToken cancellationToken)
        {
            var lesson = await _lessonRepository.GetByIdAsync(request.LessonId)
            ?? throw new NotFoundException("Lesson không tồn tại");

            lesson.Title = request.Request.Title.Trim();
            lesson.Slug = request.Request.Slug.Trim();
            lesson.VideoUrl = request.Request.VideoUrl;
            lesson.Content = request.Request.Content;
            lesson.SortOrder = request.Request.SortOrder;
            lesson.Duration = request.Request.Duration;
            lesson.IsPreview = request.Request.IsPreview;
            lesson.IsActive = request.Request.IsActive;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _lessonRepository.UpdateAsync(lesson);
            
        }
    }
}
