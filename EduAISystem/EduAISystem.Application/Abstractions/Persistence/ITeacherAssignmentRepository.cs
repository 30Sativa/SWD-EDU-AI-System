using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ITeacherAssignmentRepository
    {
        Task AssignSubjectTeacherAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default);
        Task<bool> IsTeacherAssignedToSubjectAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default);
        Task UnassignSubjectTeacherAsync(Guid classId, Guid subjectId, Guid teacherId, CancellationToken cancellationToken = default);
    }
}
