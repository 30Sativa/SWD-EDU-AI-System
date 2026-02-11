using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class LessonRepository : ILessonRepository
    {
        public Task AddAsync(LessonDomain lesson)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(LessonDomain lesson)
        {
            throw new NotImplementedException();
        }

        public Task<LessonDomain?> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<List<LessonDomain>> GetBySectionIdAsync(Guid sectionId)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(LessonDomain lesson)
        {
            throw new NotImplementedException();
        }
    }
}
