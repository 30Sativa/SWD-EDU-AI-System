using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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

        /// <summary>
        /// Lấy danh sách giáo viên bộ môn của 1 lớp theo classId
        /// </summary>
        public async Task<List<ClassSubjectTeacherResponseDto>> GetClassSubjectTeachersAsync(Guid classId, CancellationToken cancellationToken = default)
        {
            return await _context.ClassSubjectTeachers
                .Where(x => x.ClassId == classId)
                .Include(x => x.Teacher).ThenInclude(t => t.User).ThenInclude(u => u.UserProfile)
                .Include(x => x.Subject)
                .Select(x => new ClassSubjectTeacherResponseDto
                {
                    TeacherId   = x.TeacherId,
                    FullName    = x.Teacher.User.UserProfile != null ? x.Teacher.User.UserProfile.FullName : x.Teacher.User.Email,
                    Email       = x.Teacher.User.Email,
                    SubjectId   = x.SubjectId,
                    SubjectName = x.Subject.Name,
                    AssignedAt  = x.AssignedAt
                })
                .ToListAsync(cancellationToken);
        }

        /// <summary>
        /// Lấy danh sách lớp mà giáo viên đó được phân công dạy bộ môn theo teacherId
        /// </summary>
        public async Task<List<TeacherClassSubjectResponseDto>> GetTeacherClassSubjectsAsync(Guid teacherId, CancellationToken cancellationToken = default)
        {
            return await _context.ClassSubjectTeachers
                .Where(x => x.TeacherId == teacherId)
                .Include(x => x.Class)
                .Include(x => x.Subject)
                .Select(x => new TeacherClassSubjectResponseDto
                {
                    ClassId     = x.ClassId,
                    ClassCode   = x.Class.Code,
                    ClassName   = x.Class.Name,
                    SubjectId   = x.SubjectId,
                    SubjectName = x.Subject.Name,
                    AssignedAt  = x.AssignedAt
                })
                .ToListAsync(cancellationToken);
        }
    }
}
