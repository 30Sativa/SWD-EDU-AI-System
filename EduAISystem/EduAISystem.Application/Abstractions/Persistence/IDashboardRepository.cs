using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IDashboardRepository
    {
        Task<int> GetTotalUsersAsync(CancellationToken cancellationToken = default);
        Task<int> GetTotalUsersByRoleAsync(int roleId, CancellationToken cancellationToken = default);
        Task<int> GetTotalCoursesAsync(CancellationToken cancellationToken = default);
        Task<int> GetTotalClassesAsync(CancellationToken cancellationToken = default);
        Task<int> GetTotalEnrollmentsAsync(CancellationToken cancellationToken = default);

        Task<int> GetTeacherTotalCoursesAsync(Guid teacherId, CancellationToken cancellationToken = default);
        Task<int> GetTeacherTotalClassesAsync(Guid teacherId, CancellationToken cancellationToken = default);
        Task<int> GetTeacherTotalStudentsAsync(Guid teacherId, CancellationToken cancellationToken = default);
        Task<int> GetTeacherTotalAssignmentsAsync(Guid teacherId, CancellationToken cancellationToken = default);

        Task<int> GetStudentTotalEnrolledCoursesAsync(Guid studentId, CancellationToken cancellationToken = default);
        Task<int> GetStudentTotalCompletedCoursesAsync(Guid studentId, CancellationToken cancellationToken = default);
        Task<int> GetStudentTotalClassesAsync(Guid studentId, CancellationToken cancellationToken = default);
        Task<int> GetStudentTotalAssignmentsAsync(Guid studentId, CancellationToken cancellationToken = default);
    }
}
