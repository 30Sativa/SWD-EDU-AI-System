using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public  interface ISectionRepository
    {
        Task AddAsync(SectionDomain section, CancellationToken cancellationToken);
        Task UpdateAsync(SectionDomain section);
        Task DeleteAsync(SectionDomain section);

        Task<SectionDomain?> GetByIdAsync(Guid id);
        Task<List<SectionDomain>> GetByCourseIdAsync(Guid courseId);
    }
}
