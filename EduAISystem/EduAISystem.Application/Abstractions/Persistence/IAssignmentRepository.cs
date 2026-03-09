using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IAssignmentRepository
    {
        // WRITE
        Task CreateAsync(AssignmentDomain assignment, CancellationToken cancellationToken = default);
        Task UpdateAsync(AssignmentDomain assignment, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid assignmentId, CancellationToken cancellationToken = default);

        // READ
        Task<AssignmentDomain?> GetByIdAsync(Guid assignmentId, CancellationToken cancellationToken = default);

        /// <summary>Danh sách assignment theo course cho Teacher (bao gồm Draft và Published).</summary>
        Task<List<AssignmentDomain>> GetByCourseForTeacherAsync(Guid courseId, CancellationToken cancellationToken = default);

        /// <summary>Danh sách assignment đã publish theo course cho Student.</summary>
        Task<List<AssignmentDomain>> GetPublishedByCourseForStudentAsync(Guid courseId, CancellationToken cancellationToken = default);
    }
}

