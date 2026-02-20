using EduAISystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ILessonRepository
    {
        Task AddAsync(LessonDomain lesson);
        Task UpdateAsync(LessonDomain lesson);
        Task DeleteAsync(LessonDomain lesson);

        Task<LessonDomain?> GetByIdAsync(Guid id);
        Task<List<LessonDomain>> GetBySectionIdAsync(IEnumerable<Guid> sectionId, CancellationToken  cancellation);
        Task AddRangeAsync(IEnumerable<LessonDomain> lessons, CancellationToken cancellation);
    }
}
