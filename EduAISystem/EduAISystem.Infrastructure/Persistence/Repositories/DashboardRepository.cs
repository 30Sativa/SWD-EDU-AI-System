using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly EduAiDbV5Context _context;

        public DashboardRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<int> GetTotalUsersAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Users.Where(x => x.DeletedAt == null && x.IsActive == true).CountAsync(cancellationToken);
        }

        public async Task<int> GetTotalUsersByRoleAsync(int roleId, CancellationToken cancellationToken = default)
        {
            return await _context.Users.Where(x => x.DeletedAt == null && x.IsActive == true && x.Role == roleId).CountAsync(cancellationToken);
        }

        public async Task<int> GetTotalCoursesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Courses.Where(x => x.DeletedAt == null && x.IsTemplate == false).CountAsync(cancellationToken);
        }

        public async Task<int> GetTotalClassesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Classes.Where(x => x.IsActive == true).CountAsync(cancellationToken);
        }

        public async Task<int> GetTotalEnrollmentsAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Enrollments.CountAsync(cancellationToken);
        }

        public async Task<int> GetTeacherTotalCoursesAsync(Guid teacherId, CancellationToken cancellationToken = default)
        {
            return await _context.Courses.Where(x => x.DeletedAt == null && x.TeacherId == teacherId).CountAsync(cancellationToken);
        }

        public async Task<int> GetTeacherTotalClassesAsync(Guid teacherId, CancellationToken cancellationToken = default)
        {
            return await _context.Classes.Where(x => x.IsActive == true && x.TeacherId == teacherId).CountAsync(cancellationToken);
        }

        public async Task<int> GetTeacherTotalStudentsAsync(Guid teacherId, CancellationToken cancellationToken = default)
        {
            return await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.Course.TeacherId == teacherId && e.Course.DeletedAt == null)
                .Select(e => e.StudentId)
                .Distinct()
                .CountAsync(cancellationToken);
        }

        public async Task<int> GetTeacherTotalAssignmentsAsync(Guid teacherId, CancellationToken cancellationToken = default)
        {
            return await _context.Assignments
                .Include(a => a.Course)
                .Where(a => a.Course.TeacherId == teacherId && a.Course.DeletedAt == null)
                .CountAsync(cancellationToken);
        }

        public async Task<int> GetStudentTotalEnrolledCoursesAsync(Guid studentId, CancellationToken cancellationToken = default)
        {
            return await _context.Enrollments.Where(e => e.StudentId == studentId && e.Status != "Completed").CountAsync(cancellationToken);
        }

        public async Task<int> GetStudentTotalCompletedCoursesAsync(Guid studentId, CancellationToken cancellationToken = default)
        {
            return await _context.Enrollments.Where(e => e.StudentId == studentId && e.Status == "Completed").CountAsync(cancellationToken);
        }

        public async Task<int> GetStudentTotalClassesAsync(Guid studentId, CancellationToken cancellationToken = default)
        {
            return await _context.StudentClasses.Where(sc => sc.StudentId == studentId).CountAsync(cancellationToken);
        }

        public async Task<int> GetStudentTotalAssignmentsAsync(Guid studentId, CancellationToken cancellationToken = default)
        {
            return await _context.Assignments
                .Include(a => a.Course)
                .ThenInclude(c => c.Enrollments)
                .Where(a => a.Course.Enrollments.Any(e => e.StudentId == studentId))
                .CountAsync(cancellationToken);
        }
    }
}
