using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ISubmissionRepository
    {
        Task CreateAsync(SubmissionDomain submission, CancellationToken cancellationToken = default);
        Task UpdateAsync(SubmissionDomain submission, CancellationToken cancellationToken = default);
        Task<SubmissionDomain?> GetByIdAsync(Guid submissionId, CancellationToken cancellationToken = default);

        /// <summary>Lấy submission mới nhất của một học sinh cho 1 assignment (phục vụ nộp nhiều lần).</summary>
        Task<SubmissionDomain?> GetLatestByStudentAsync(Guid assignmentId, Guid studentId, CancellationToken cancellationToken = default);

        /// <summary>Danh sách submission theo assignment để GV chấm.</summary>
        Task<List<SubmissionDomain>> GetByAssignmentAsync(Guid assignmentId, CancellationToken cancellationToken = default);
    }
}

