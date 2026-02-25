using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Features.Enrollments.Commands;
using EduAISystem.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            var studentId = _currentUser.UserId;

            var course = await _courseRepo.GetByIdAsync(request.CourseId);

            if (course == null)
                throw new Exception("Course not found.");

            course.EnsureCanBeEnrolled();

            var exists = await _enrollRepo
                .ExistsAsync(studentId, request.CourseId);

            if (exists)
                throw new Exception("Already enrolled.");

            var enrollment = new EnrollmentDomain(studentId, request.CourseId);

            await _enrollRepo.AddAsync(enrollment);

            return enrollment.Id;
        }
    }
}
