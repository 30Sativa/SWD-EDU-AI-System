using EduAISystem.Application.Features.Classes.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ITeacherAssignmentRepository
    {
        Task AssignSubjectTeacherAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default);
        Task<bool> IsTeacherAssignedToSubjectAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default);
        Task UnassignSubjectTeacherAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default);

        /// <summary>Lấy danh sách giáo viên bộ môn của 1 lớp theo classId</summary>
        Task<List<ClassSubjectTeacherResponseDto>> GetClassSubjectTeachersAsync(Guid classId, CancellationToken cancellationToken = default);

        /// <summary>Lấy danh sách lớp mà giáo viên đó được phân công dạy bộ môn theo teacherId</summary>
        Task<List<TeacherClassSubjectResponseDto>> GetTeacherClassSubjectsAsync(Guid teacherId, CancellationToken cancellationToken = default);
    }
}
