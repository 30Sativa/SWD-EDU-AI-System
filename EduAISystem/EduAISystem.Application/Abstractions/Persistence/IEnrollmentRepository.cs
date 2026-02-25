using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IEnrollmentRepository
    {
        Task<bool> ExistsAsync(Guid studentId, Guid courseId);
        Task AddAsync(EnrollmentDomain enrollment);
        Task<EnrollmentDomain?> GetAsync(Guid studentId, Guid courseId);
        Task<PagedResult<EnrollmentDomain>> GetPagedByStudentAsync(Guid studentId,int page,int pageSize);
    }
}
