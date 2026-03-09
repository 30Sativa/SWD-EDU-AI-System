using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Enrollments.Commands;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Enrollments.Handler
{
    public class EnrollCourseCommandHandler
    : IRequestHandler<EnrollCourseCommand, Guid>
    {
        private readonly ICourseRepository _courseRepo;
        private readonly IEnrollmentRepository _enrollRepo;
        private readonly ICurrentUserService _currentUser;

        public EnrollCourseCommandHandler(
            ICourseRepository courseRepo,
            IEnrollmentRepository enrollRepo,
            ICurrentUserService currentUser)
        {
            _courseRepo = courseRepo;
            _enrollRepo = enrollRepo;
            _currentUser = currentUser;
        }

        public async Task<Guid> Handle(
            EnrollCourseCommand request,
            CancellationToken cancellationToken)
        {
            // Get student ID from current user (JWT token)
            var studentId = _currentUser.UserId;
            
            // Validate student is authenticated
            if (studentId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("Student must be authenticated to enroll in a course.");
            }

            // Get course
            var course = await _courseRepo.GetByIdAsync(request.CourseId, cancellationToken);

            if (course == null)
                throw new NotFoundException($"Course with id {request.CourseId} does not exist.");

            // Validate course can be enrolled
            course.EnsureCanBeEnrolled();

            // Check if already enrolled
            var exists = await _enrollRepo
                .ExistsAsync(studentId, request.CourseId, cancellationToken);

            if (exists)
                throw new ConflictException("Student is already enrolled in this course.");

            // Create enrollment
            var enrollment = new EnrollmentDomain(studentId, request.CourseId);

            await _enrollRepo.AddAsync(enrollment, cancellationToken);

            return enrollment.Id;
        }
    }
}
