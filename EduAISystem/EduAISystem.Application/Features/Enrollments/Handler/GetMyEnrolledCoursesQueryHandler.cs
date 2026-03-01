using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Enrollments.DTOs.Response;
using EduAISystem.Application.Features.Enrollments.Queries;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Enrollments.Handler
{
    public class GetMyEnrolledCoursesQueryHandler
        : IRequestHandler<GetMyEnrolledCoursesQuery, PagedResult<MyEnrolledCourseResponseDto>>
    {
        private readonly IEnrollmentRepository _enrollmentRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly ICurrentUserService _currentUser;

        public GetMyEnrolledCoursesQueryHandler(
            IEnrollmentRepository enrollmentRepository,
            ICourseRepository courseRepository,
            ICurrentUserService currentUser)
        {
            _enrollmentRepository = enrollmentRepository;
            _courseRepository = courseRepository;
            _currentUser = currentUser;
        }

        public async Task<PagedResult<MyEnrolledCourseResponseDto>> Handle(
            GetMyEnrolledCoursesQuery request,
            CancellationToken cancellationToken)
        {
            var studentId = _currentUser.UserId;

            // Validate student is authenticated
            if (studentId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("Student must be authenticated to view enrolled courses.");
            }

            // Lấy tất cả enrollments của student
            var enrollments = await _enrollmentRepository
                .GetPagedByStudentAsync(studentId, request.Page, request.PageSize, cancellationToken);

            var items = new List<MyEnrolledCourseResponseDto>();

            foreach (var enrollment in enrollments.Items)
            {
                var course = await _courseRepository
                    .GetByIdAsync(enrollment.CourseId, cancellationToken);

                if (course == null)
                    continue;

                items.Add(new MyEnrolledCourseResponseDto
                {
                    CourseId = course.Id,
                    Title = course.Title,
                    Thumbnail = course.Thumbnail,
                    Progress = enrollment.Progress,
                    Status = enrollment.Status.ToString(),
                    EnrolledAt = enrollment.EnrolledAt
                });
            }

            return new PagedResult<MyEnrolledCourseResponseDto>
            {
                Items = items,
                TotalCount = enrollments.TotalCount,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
