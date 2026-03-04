using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class PublishCourseCommandHandler : IRequestHandler<PublishCourseCommand, Unit>
    {
        private readonly ICourseRepository _courseRepository;

        public PublishCourseCommandHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
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
            return Unit.Value;
        }
    }
}

