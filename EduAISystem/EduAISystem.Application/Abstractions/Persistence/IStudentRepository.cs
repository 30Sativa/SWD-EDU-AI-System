using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IStudentRepository
    {
        Task<PagedResult<StudentListDomain>> GetStudentsPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            Guid? gradeLevelId,
            Guid? termId,
            Guid? classId,
            bool? isActiveFilter,
            CancellationToken cancellationToken = default);

        Task<List<Guid>> GetStudentIdsByGradeLevelAsync(Guid gradeLevelId, CancellationToken cancellationToken = default);
        Task<List<Guid>> GetStudentIdsByClassIdAsync(Guid classId, CancellationToken cancellationToken = default);
    }
}
