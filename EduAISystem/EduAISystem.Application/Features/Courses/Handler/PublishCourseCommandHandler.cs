using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class PublishCourseCommandHandler : IRequestHandler<PublishCourseCommand, bool>
    {
        private readonly ICourseRepository _courseRepository;

        public PublishCourseCommandHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<bool> Handle(PublishCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.CourseId, cancellationToken);
            if (course == null)
            {
                return false;
            }

            if (course.TeacherId != request.TeacherId)
            {
                return false;
            }

            try
            {
                course.Publish();
            }
            catch (InvalidOperationException)
            {
                // Course không đủ điều kiện publish (template, archived, thiếu thông tin, ...)
                return false;
            }

            await _courseRepository.UpdateAsync(course, cancellationToken);
            return true;
        }
    }
}

