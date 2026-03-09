using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly EduAiDbV5Context _context;

        public StudentRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<PagedResult<StudentListDomain>> GetStudentsPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            Guid? gradeLevelId,
            Guid? termId,
            Guid? classId,
            bool? isActiveFilter,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Students
                .AsNoTracking()
                .Include(s => s.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(s => s.GradeLevel)
                .Include(s => s.StudentClasses)
                    .ThenInclude(sc => sc.Class)
                        .ThenInclude(c => c.Term)
                .AsQueryable();

            // Filter out softly deleted users
            query = query.Where(s => s.User.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(s =>
                    (s.User.Email != null && s.User.Email.Contains(term)) ||
                    (s.User.UserProfile != null && s.User.UserProfile.FullName != null && s.User.UserProfile.FullName.Contains(term)) ||
                    (s.StudentCode != null && s.StudentCode.Contains(term))
                );
            }

            if (gradeLevelId.HasValue)
            {
                query = query.Where(s => s.GradeLevelId == gradeLevelId.Value);
            }

            if (classId.HasValue)
            {
                query = query.Where(s => s.StudentClasses.Any(sc => sc.ClassId == classId.Value));
            }

            if (termId.HasValue)
            {
                // Find students who belong to a class that is in the given term
                query = query.Where(s => s.StudentClasses.Any(sc => sc.Class != null && sc.Class.TermId == termId.Value));
            }

            if (isActiveFilter.HasValue)
            {
                query = query.Where(s => s.User.IsActive == isActiveFilter.Value);
            }

            query = query.OrderByDescending(s => s.User.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var domains = entities.Select(s => new StudentListDomain
            {
                UserId = s.UserId,
                Email = s.User?.Email ?? string.Empty,
                FullName = s.User?.UserProfile?.FullName,
                StudentCode = s.StudentCode,
                Role = (UserRoleDomain)(s.User?.Role ?? 1),
                IsActive = s.User?.IsActive ?? false,
                CreatedAt = s.User?.CreatedAt ?? DateTime.MinValue,
                GradeLevelId = s.GradeLevelId,
                GradeLevelName = s.GradeLevel?.Name,
                Classes = s.StudentClasses?.Select(sc => new StudentClassInfo
                {
                    ClassId = sc.ClassId,
                    ClassName = sc.Class?.Name,
                    TermId = sc.Class?.TermId,
                    TermName = sc.Class?.Term?.Name
                }).ToList() ?? new List<StudentClassInfo>()
            }).ToList();

            return new PagedResult<StudentListDomain>
            {
                Items = domains,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
