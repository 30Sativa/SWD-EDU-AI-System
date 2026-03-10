using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Domain.Enums;
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
        private readonly ISectionRepository _sectionRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly INotificationService _notificationService;

        public UpdateLessonCommandHandler(
            ILessonRepository lessonRepository,
            ISectionRepository sectionRepository,
            ICourseRepository courseRepository,
            INotificationService notificationService)
        {
            _lessonRepository = lessonRepository;
            _sectionRepository = sectionRepository;
            _courseRepository = courseRepository;
            _notificationService = notificationService;
        }

        public async Task Handle(UpdateLessonCommand request, CancellationToken cancellationToken)
        {
            var lesson = await _lessonRepository.GetByIdAsync(request.LessonId)
                ?? throw new NotFoundException("Lesson không tồn tại");

            bool isContentUpdated = false;
            if (lesson.VideoUrl != request.Request.VideoUrl ||
                lesson.MaterialUrl != request.Request.MaterialUrl)
            {
                isContentUpdated = true;
            }

            lesson.Title = request.Request.Title.Trim();
            lesson.Slug = request.Request.Slug.Trim();
            lesson.VideoUrl = request.Request.VideoUrl;
            lesson.Content = request.Request.Content;
            lesson.SortOrder = request.Request.SortOrder;
            lesson.Duration = request.Request.Duration;
            lesson.IsPreview = request.Request.IsPreview;
            lesson.IsActive = request.Request.IsActive;
            
            if (request.Request.VideoType != null) lesson.VideoType = request.Request.VideoType;
            if (request.Request.MaterialUrl != null) lesson.MaterialUrl = request.Request.MaterialUrl;
            if (request.Request.MaterialType != null) lesson.MaterialType = request.Request.MaterialType;
            if (request.Request.CanUseAI != null) lesson.CanUseAI = request.Request.CanUseAI;
            if (request.Request.AIProcessingStatus != null) lesson.AIProcessingStatus = request.Request.AIProcessingStatus;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _lessonRepository.UpdateAsync(lesson);
            
            if (isContentUpdated)
            {
                var section = await _sectionRepository.GetByIdAsync(lesson.SectionId);
                if (section != null)
                {
                    var course = await _courseRepository.GetByIdAsync(section.CourseId, cancellationToken);
                    if (course != null && course.Status == CourseStatusDomain.Published)
                    {
                        var studentIds = await _courseRepository.GetStudentIdsByCourseClassesAsync(course.Id, cancellationToken);
                        if (studentIds.Any())
                        {
                            await _notificationService.SendBatchNotificationAsync(
                                studentIds,
                                NotificationTypeDomain.System,
                                "Cập nhật bài học",
                                $"Giáo viên đã cập nhật tài liệu hoặc video mới cho bài học '{lesson.Title}' trong khóa học '{course.Title}'.",
                                $"/student/lessons/{lesson.Id}",
                                cancellationToken);
                        }
                    }
                }
            }
        }
    }
}
