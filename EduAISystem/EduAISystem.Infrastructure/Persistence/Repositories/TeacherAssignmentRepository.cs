using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class TeacherAssignmentRepository : ITeacherAssignmentRepository
    {
        private readonly EduAiDbV5Context _context;

        public TeacherAssignmentRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task AssignSubjectTeacherAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default)
        {
            var exists = await _context.ClassSubjectTeachers
                .AnyAsync(x => x.ClassId == classId && x.SubjectId == subjectId && x.TeacherId == teacherId, cancellationToken);

            if (exists) return;

            var assignment = new ClassSubjectTeacher
            {
                ClassId = classId,
                SubjectId = subjectId,
                TeacherId = teacherId,
                AssignedAt = DateTime.UtcNow
            };

            _context.ClassSubjectTeachers.Add(assignment);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> IsTeacherAssignedToSubjectAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default)
        {
            return await _context.ClassSubjectTeachers
                .AnyAsync(x => x.ClassId == classId && x.SubjectId == subjectId && x.TeacherId == teacherId, cancellationToken);
        }

        public async Task UnassignSubjectTeacherAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default)
        {
            var assignment = await _context.ClassSubjectTeachers
                .FirstOrDefaultAsync(x => x.ClassId == classId && x.SubjectId == subjectId && x.TeacherId == teacherId, cancellationToken);

            if (assignment != null)
            {
                _context.ClassSubjectTeachers.Remove(assignment);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}
