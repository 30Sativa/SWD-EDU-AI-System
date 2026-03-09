using EduAISystem.Application.Features.Dashboards.DTOs.Response;
using MediatR;
using System;

namespace EduAISystem.Application.Features.Dashboards.Queries
{
    public class GetAdminDashboardStatsQuery : IRequest<AdminDashboardResponseDto>
    {
    }

    public class GetTeacherDashboardStatsQuery : IRequest<TeacherDashboardResponseDto>
    {
        public Guid TeacherId { get; set; }

        public GetTeacherDashboardStatsQuery(Guid teacherId)
        {
            TeacherId = teacherId;
        }
    }

    public class GetStudentDashboardStatsQuery : IRequest<StudentDashboardResponseDto>
    {
        public Guid StudentId { get; set; }

        public GetStudentDashboardStatsQuery(Guid studentId)
        {
            StudentId = studentId;
        }
    }
}
