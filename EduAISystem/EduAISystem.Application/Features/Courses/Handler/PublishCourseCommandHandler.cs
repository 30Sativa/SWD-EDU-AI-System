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

            // Kiểm tra khóa học đã đủ thông tin tối thiểu để publish chưa
            //if (!course.IsReadyForPublish())
            //{
            //    return false;
            //}

            course.Publish();
            await _courseRepository.UpdateAsync(course, cancellationToken);
            return true;
        }
    }
}

