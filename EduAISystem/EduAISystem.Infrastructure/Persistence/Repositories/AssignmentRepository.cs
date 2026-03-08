using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class AssignmentRepository : IAssignmentRepository
    {
        private readonly EduAiDbV5Context _context;

        public AssignmentRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task CreateAsync(AssignmentDomain assignment, CancellationToken cancellationToken = default)
        {
            var entity = MapToEntity(assignment);
            _context.Assignments.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(AssignmentDomain assignment, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignment.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Assignment {assignment.Id} không tồn tại.");

            entity.Title = assignment.Title;
            entity.Description = assignment.Description;
            entity.DueDate = assignment.DueDate;
            entity.MaxScore = assignment.MaxScore;
            entity.IsPublished = assignment.Status == AssignmentStatusDomain.Published;
            entity.UpdatedAt = assignment.UpdatedAt;
            entity.AllowedFileTypes = assignment.AllowedFileTypes;
            entity.MaxFileSizeMB = assignment.MaxFileSizeMB;
            entity.AllowTextSubmit = assignment.AllowTextSubmit;
            entity.AllowFileSubmit = assignment.AllowFileSubmit;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid assignmentId, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignmentId, cancellationToken);

            if (entity is null)
            {
                return;
            }

            _context.Assignments.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<AssignmentDomain?> GetByIdAsync(Guid assignmentId, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Assignments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == assignmentId, cancellationToken);

            return entity is null ? null : MapToDomain(entity);
        }

        public async Task<List<AssignmentDomain>> GetByCourseForTeacherAsync(Guid courseId, CancellationToken cancellationToken = default)
        {
            var entities = await _context.Assignments
                .AsNoTracking()
                .Where(a => a.CourseId == courseId)
                .OrderBy(a => a.DueDate)
                .ThenBy(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            return entities.Select(MapToDomain).ToList();
        }

        public async Task<List<AssignmentDomain>> GetPublishedByCourseForStudentAsync(Guid courseId, CancellationToken cancellationToken = default)
        {
            var entities = await _context.Assignments
                .AsNoTracking()
                .Where(a => a.CourseId == courseId && a.IsPublished == true)
                .OrderBy(a => a.DueDate)
                .ThenBy(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            return entities.Select(MapToDomain).ToList();
        }

        private static Assignment MapToEntity(AssignmentDomain d)
        {
            return new Assignment
            {
                Id = d.Id,
                CourseId = d.CourseId,
                Title = d.Title,
                Description = d.Description,
                DueDate = d.DueDate,
                MaxScore = d.MaxScore,
                IsPublished = d.Status == AssignmentStatusDomain.Published,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                AllowedFileTypes = d.AllowedFileTypes,
                MaxFileSizeMB = d.MaxFileSizeMB,
                AllowTextSubmit = d.AllowTextSubmit,
                AllowFileSubmit = d.AllowFileSubmit
            };
        }

        private static AssignmentDomain MapToDomain(Assignment e)
        {
            var status = e.IsPublished == true
                ? AssignmentStatusDomain.Published
                : AssignmentStatusDomain.Draft;

            return new AssignmentDomain(
                e.Id,
                e.CourseId,
                e.Title,
                e.Description,
                e.DueDate,
                e.MaxScore,
                status,
                e.CreatedAt,
                e.UpdatedAt,
                e.AllowedFileTypes,
                e.MaxFileSizeMB,
                e.AllowTextSubmit,
                e.AllowFileSubmit
            );
        }
    }
}

