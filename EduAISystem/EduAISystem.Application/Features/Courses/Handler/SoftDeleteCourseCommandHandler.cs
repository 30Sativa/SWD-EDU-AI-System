using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Domain.Enums;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class SoftDeleteCourseCommandHandler : IRequestHandler<SoftDeleteCourseCommand, bool>
    {
        private readonly ICourseRepository _courseRepository;

        public SoftDeleteCourseCommandHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<bool> Handle(SoftDeleteCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.Id, cancellationToken);
            if (course == null)
            {
                return false;
            }

            // Chỉ cho phép xóa mềm khi khóa học đang ở trạng thái Draft
            if (course.Status != CourseStatusDomain.Draft)
            {
                return false;
            }

            course.SoftDelete();
            await _courseRepository.UpdateAsync(course, cancellationToken);

            return true;
        }
    }
}

