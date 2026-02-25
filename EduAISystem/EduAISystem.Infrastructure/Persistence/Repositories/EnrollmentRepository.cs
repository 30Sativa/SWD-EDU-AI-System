using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class EnrollmentRepository : IEnrollmentRepository
    {
        private readonly EduAiDbV5Context _context;

        public EnrollmentRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        // =========================
        // EXISTS
        // =========================
        public async Task<bool> ExistsAsync(Guid studentId, Guid courseId)
        {
            return await _context.Enrollments
                .AnyAsync(e => e.StudentId == studentId &&
                               e.CourseId == courseId);
        }

        // =========================
        // ADD
        // =========================
        public async Task AddAsync(EnrollmentDomain enrollment)
        {
            var entity = MapToEntity(enrollment);

            _context.Enrollments.Add(entity);

            await _context.SaveChangesAsync();
        }

        // =========================
        // GET
        // =========================
        public async Task<EnrollmentDomain?> GetAsync(Guid studentId, Guid courseId)
        {
            var entity = await _context.Enrollments
                .AsNoTracking()
                .FirstOrDefaultAsync(e =>
                    e.StudentId == studentId &&
                    e.CourseId == courseId);

            return entity == null ? null : MapToDomain(entity);
        }

        // =========================
        // PRIVATE MAPPERS
        // =========================

        private static Enrollment MapToEntity(EnrollmentDomain d)
        {
            return new Enrollment
            {
                Id = d.Id,
                StudentId = d.StudentId,
                CourseId = d.CourseId,
                Status = MapStatusToString(d.Status),
                Progress = d.Progress,
                EnrolledAt = d.EnrolledAt,
                CompletedAt = d.CompletedAt
            };
        }

        private static EnrollmentDomain MapToDomain(Enrollment e)
        {
            return EnrollmentDomain.Load(
                e.Id,
                e.StudentId,
                e.CourseId,
                MapStatusToEnum(e.Status),
                e.Progress ?? 0m,
                e.EnrolledAt ?? DateTime.UtcNow,
                e.CompletedAt
            );
        }

        private static string MapStatusToString(EnrollmentStatusDomain status)
        {
            return status switch
            {
                EnrollmentStatusDomain.Completed => "Completed",
                EnrollmentStatusDomain.Dropped => "Dropped",
                EnrollmentStatusDomain.Expired => "Expired",
                _ => "Active"
            };
        }

        private static EnrollmentStatusDomain MapStatusToEnum(string? status)
        {
            return status switch
            {
                "Completed" => EnrollmentStatusDomain.Completed,
                "Dropped" => EnrollmentStatusDomain.Dropped,
                "Expired" => EnrollmentStatusDomain.Expired,
                _ => EnrollmentStatusDomain.Active
            };
        }

        public async Task<PagedResult<EnrollmentDomain>> GetPagedByStudentAsync(Guid studentId, int page, int pageSize)
        {
            var query = _context.Enrollments
        .AsNoTracking()
        .Where(e => e.StudentId == studentId);

            var totalCount = await query.CountAsync();

            var entities = await query
                .OrderByDescending(e => e.EnrolledAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var domains = entities.Select(MapToDomain).ToList();

            return new PagedResult<EnrollmentDomain>
            {
                Items = domains,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}