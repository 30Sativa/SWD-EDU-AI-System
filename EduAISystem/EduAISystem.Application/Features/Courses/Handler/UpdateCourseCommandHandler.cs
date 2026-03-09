using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class UpdateCourseCommandHandler : IRequestHandler<UpdateCourseCommand, Unit>
    {
        private readonly ICourseRepository _courseRepository;

        public UpdateCourseCommandHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<Unit> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.CourseId, cancellationToken);

            if (course == null)
                throw new NotFoundException($"Course with id {request.CourseId} does not exist.");

            // Verify teacher owns this course
            if (course.TeacherId != request.TeacherId)
                throw new ForbiddenException("You do not have permission to update this course.");

            // Verify course is not a template
            if (course.IsTemplate)
                throw new ConflictException("Cannot update template course.");

            // Update course basic info
            course.UpdateBasicInfo(
                title: request.Request.Title,
                description: request.Request.Description,
                thumbnail: request.Request.Thumbnail,
                level: request.Request.Level,
                language: request.Request.Language
            );

            await _courseRepository.UpdateAsync(course, cancellationToken);

            return Unit.Value;
        }
    }
}
