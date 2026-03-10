using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Domain.Enums;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class PublishCourseCommandHandler : IRequestHandler<PublishCourseCommand, Unit>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly INotificationService _notificationService;

        public PublishCourseCommandHandler(
            ICourseRepository courseRepository,
            INotificationService notificationService)
        {
            _courseRepository = courseRepository;
            _notificationService = notificationService;
        }

        public async Task<Unit> Handle(PublishCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.CourseId, cancellationToken);

            if (course == null)
                throw new NotFoundException($"Course with id {request.CourseId} does not exist.");

            if (course.TeacherId != request.TeacherId)
                throw new ForbiddenException("You do not have permission to publish this course.");

            try
            {
                course.Publish();
            }
            catch (InvalidOperationException ex)
            {
                // Template, archived, or not ready (missing Title/Description/Thumbnail)
                throw new ConflictException(ex.Message);
            }

            await _courseRepository.UpdateAsync(course, cancellationToken);

            // Gửi thông báo cho học sinh trong các lớp được gán khóa học
            var studentIds = await _courseRepository.GetStudentIdsByCourseClassesAsync(course.Id, cancellationToken);
            if (studentIds.Any())
            {
                await _notificationService.SendBatchNotificationAsync(
                    studentIds,
                    NotificationTypeDomain.System,
                    "Khóa học mới xuất bản",
                    $"Khóa học '{course.Title}' đã chính thức ra mắt. Khám phá ngay!",
                    $"/student/courses/{course.Id}", // Hoặc slug tuỳ thiết kế
                    cancellationToken);
            }

            return Unit.Value;
        }
    }
}

