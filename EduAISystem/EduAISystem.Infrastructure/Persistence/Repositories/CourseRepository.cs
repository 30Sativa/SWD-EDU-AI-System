using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly EduAiDbV5Context _context;

        public CourseRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task AddAsync(CourseDomain course, CancellationToken cancellationToken = default)
        {
            var entity = new Course
            {
                Id = course.Id,
                Code = course.Code,
                Title = course.Title,
                Slug = course.Slug,
                Description = course.Description,
                Thumbnail = course.Thumbnail,
                SubjectId = course.SubjectId,
                GradeLevelId = course.GradeLevelId,
                TeacherId = course.TeacherId,
                CategoryId = course.CategoryId,
                Level = course.Level,
                Language = course.Language,
                Price = course.Price,
                DiscountPrice = course.DiscountPrice,
                TotalLessons = course.TotalLessons,
                TotalDuration = course.TotalDuration,
                EnrollmentCount = course.EnrollmentCount,
                Rating = course.Rating,
                ReviewCount = course.ReviewCount,
                Status = MapStatusToString(course.Status),
                IsActive = course.IsActive,
                IsFeatured = course.IsFeatured,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt,
                DeletedAt = course.DeletedAt
            };

            _context.Courses.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<CourseDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Courses
                .AsNoTracking()
                .Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null, cancellationToken);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<PagedResult<CourseDomain>> GetTeacherCoursesPagedAsync(
            Guid teacherId,
            int page,
            int pageSize,
            string? searchTerm,
            string? statusFilter,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Courses
                .AsNoTracking()
                .Include(c => c.Subject)
                .Where(c => c.DeletedAt == null && c.TeacherId == teacherId);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(c =>
                    c.Title.Contains(term) ||
                    c.Code.Contains(term) ||
                    (c.Description != null && c.Description.Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(statusFilter))
            {
                query = query.Where(c => c.Status == statusFilter);
            }

            query = query.OrderByDescending(c => c.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var items = entities.Select(MapToDomain).ToList();

            return new PagedResult<CourseDomain>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task UpdateAsync(CourseDomain course, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == course.Id && c.DeletedAt == null, cancellationToken);

            if (entity == null)
            {
                return;
            }

            entity.Title = course.Title;
            entity.Slug = course.Slug;
            entity.Description = course.Description;
            entity.Thumbnail = course.Thumbnail;
            entity.Level = course.Level;
            entity.Language = course.Language;
            entity.Price = course.Price;
            entity.DiscountPrice = course.DiscountPrice;
            entity.TotalLessons = course.TotalLessons;
            entity.TotalDuration = course.TotalDuration;
            entity.EnrollmentCount = course.EnrollmentCount;
            entity.Rating = course.Rating;
            entity.ReviewCount = course.ReviewCount;
            entity.Status = MapStatusToString(course.Status);
            entity.IsActive = course.IsActive;
            entity.IsFeatured = course.IsFeatured;
            entity.UpdatedAt = course.UpdatedAt;

            await _context.SaveChangesAsync(cancellationToken);
        }

        private static CourseDomain MapToDomain(Course c)
        {
            return CourseDomain.Load(
                c.Id,
                c.Code,
                c.Title,
                c.Slug,
                c.Description,
                c.Thumbnail,
                c.SubjectId,
                c.Subject?.Name ?? string.Empty,
                c.GradeLevelId,
                c.TeacherId,
                c.CategoryId,
                c.Level,
                c.Language,
                c.Price ?? 0,
                c.DiscountPrice,
                c.TotalLessons ?? 0,
                c.TotalDuration ?? 0,
                c.EnrollmentCount ?? 0,
                c.Rating ?? 0,
                c.ReviewCount ?? 0,
                MapStatusToEnum(c.Status),
                c.IsActive ?? true,
                c.IsFeatured ?? false,
                c.CreatedAt ?? DateTime.UtcNow,
                c.UpdatedAt,
                c.DeletedAt);
        }

        private static CourseStatusDomain MapStatusToEnum(string? status)
        {
            return status switch
            {
                "Published" => CourseStatusDomain.Published,
                "Archived" => CourseStatusDomain.Archived,
                _ => CourseStatusDomain.Draft
            };
        }

        private static string MapStatusToString(CourseStatusDomain status)
        {
            return status switch
            {
                CourseStatusDomain.Published => "Published",
                CourseStatusDomain.Archived => "Archived",
                _ => "Draft"
            };
        }
    }
}

