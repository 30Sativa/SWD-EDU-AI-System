using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IClassRepository
    {
        Task<PagedResult<ClassDomain>> GetClassesPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            Guid? termId,
            Guid? teacherId,
            Guid? gradeLevelId,
            CancellationToken cancellationToken = default);

        Task<ClassDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

        Task AddAsync(ClassDomain classEntity, CancellationToken cancellationToken = default);

        Task UpdateAsync(ClassDomain classEntity, CancellationToken cancellationToken = default);

        Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task EnrollStudentToClassAsync(Guid studentId, Guid classId, CancellationToken cancellationToken = default);
        Task<bool> RemoveStudentFromClassAsync(Guid studentId, Guid classId, CancellationToken cancellationToken = default);

        Task<List<StudentInClassResponseDto>> GetStudentsByClassIdAsync(Guid classId, CancellationToken cancellationToken = default);
        Task<List<ClassDomain>> GetClassesByTeacherAsync(Guid teacherId, CancellationToken cancellationToken = default);
    }
}

