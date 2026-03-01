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
        Task<bool> ExistsAsync(Guid studentId, Guid courseId, CancellationToken cancellationToken = default);
        Task AddAsync(EnrollmentDomain enrollment, CancellationToken cancellationToken = default);
        Task<EnrollmentDomain?> GetAsync(Guid studentId, Guid courseId, CancellationToken cancellationToken = default);
        Task<PagedResult<EnrollmentDomain>> GetPagedByStudentAsync(Guid studentId, int page, int pageSize, CancellationToken cancellationToken = default);
    }
}
