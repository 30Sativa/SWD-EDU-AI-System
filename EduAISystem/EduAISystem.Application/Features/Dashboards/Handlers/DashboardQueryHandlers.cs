using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Dashboards.DTOs.Response;
using EduAISystem.Application.Features.Dashboards.Queries;
using EduAISystem.Domain.Enums;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Dashboards.Handlers
{
    public class GetAdminDashboardStatsQueryHandler : IRequestHandler<GetAdminDashboardStatsQuery, AdminDashboardResponseDto>
    {
        private readonly IDashboardRepository _dashboardRepository;

        public GetAdminDashboardStatsQueryHandler(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<AdminDashboardResponseDto> Handle(GetAdminDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            // Note: Replace UserRoleDomain integer casts with your actual Enum values based on UserRoleDomain.cs
            return new AdminDashboardResponseDto
            {
                TotalUsers = await _dashboardRepository.GetTotalUsersAsync(cancellationToken),
                TotalStudents = await _dashboardRepository.GetTotalUsersByRoleAsync((int)UserRoleDomain.Student, cancellationToken),
                TotalTeachers = await _dashboardRepository.GetTotalUsersByRoleAsync((int)UserRoleDomain.Teacher, cancellationToken),
                TotalCourses = await _dashboardRepository.GetTotalCoursesAsync(cancellationToken),
                TotalClasses = await _dashboardRepository.GetTotalClassesAsync(cancellationToken),
                TotalEnrollments = await _dashboardRepository.GetTotalEnrollmentsAsync(cancellationToken)
            };
        }
    }

    public class GetTeacherDashboardStatsQueryHandler : IRequestHandler<GetTeacherDashboardStatsQuery, TeacherDashboardResponseDto>
    {
        private readonly IDashboardRepository _dashboardRepository;

        public GetTeacherDashboardStatsQueryHandler(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<TeacherDashboardResponseDto> Handle(GetTeacherDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            return new TeacherDashboardResponseDto
            {
                TotalCourses = await _dashboardRepository.GetTeacherTotalCoursesAsync(request.TeacherId, cancellationToken),
                TotalClasses = await _dashboardRepository.GetTeacherTotalClassesAsync(request.TeacherId, cancellationToken),
                TotalStudents = await _dashboardRepository.GetTeacherTotalStudentsAsync(request.TeacherId, cancellationToken),
                TotalAssignments = await _dashboardRepository.GetTeacherTotalAssignmentsAsync(request.TeacherId, cancellationToken)
            };
        }
    }

    public class GetStudentDashboardStatsQueryHandler : IRequestHandler<GetStudentDashboardStatsQuery, StudentDashboardResponseDto>
    {
        private readonly IDashboardRepository _dashboardRepository;

        public GetStudentDashboardStatsQueryHandler(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<StudentDashboardResponseDto> Handle(GetStudentDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            return new StudentDashboardResponseDto
            {
                TotalEnrolledCourses = await _dashboardRepository.GetStudentTotalEnrolledCoursesAsync(request.StudentId, cancellationToken),
                TotalCompletedCourses = await _dashboardRepository.GetStudentTotalCompletedCoursesAsync(request.StudentId, cancellationToken),
                TotalClasses = await _dashboardRepository.GetStudentTotalClassesAsync(request.StudentId, cancellationToken),
                TotalAssignments = await _dashboardRepository.GetStudentTotalAssignmentsAsync(request.StudentId, cancellationToken)
            };
        }
    }
}
