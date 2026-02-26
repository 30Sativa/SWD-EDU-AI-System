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

        // =========================
        // ADD
        // =========================
        public async Task AddAsync(CourseDomain course, CancellationToken cancellationToken = default)
        {
            var entity = MapToEntity(course);

            _context.Courses.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<CourseDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null, cancellationToken);

            return entity == null ? null : MapToDomain(entity);
        }

        // =========================
        // UPDATE
        // =========================
        public async Task UpdateAsync(CourseDomain course, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == course.Id && c.DeletedAt == null, cancellationToken);

            if (entity == null)
                return;

            entity.Title = course.Title;
            entity.Slug = course.Slug;
            entity.Description = course.Description;
            entity.Thumbnail = course.Thumbnail;

            // FIX: enum -> string
            entity.Level = CourseLevelToString(course.Level);

            entity.Language = course.Language;
            entity.TotalLessons = course.TotalLessons;
            entity.TotalDuration = course.TotalDuration;
            entity.Status = MapStatusToString(course.Status);
            entity.IsActive = course.IsActive;
            entity.UpdatedAt = course.UpdatedAt;

            await _context.SaveChangesAsync(cancellationToken);
        }

        // =========================
        // EXISTS
        // =========================
        public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
        {
            return await _context.Courses
                .AnyAsync(c => c.Code == code && c.DeletedAt == null, cancellationToken);
        }

        // =========================
        // PRIVATE MAPPERS
        // =========================

        private static CourseDomain MapToDomain(Course c)
        {
            var levelEnum = c.Level switch
            {
                "Intermediate" => CourseLevelDomain.Intermediate,
                "Advanced" => CourseLevelDomain.Advanced,
                _ => CourseLevelDomain.Beginner
            };

            var statusEnum = c.Status switch
            {
                "Published" => CourseStatusDomain.Published,
                "Archived" => CourseStatusDomain.Archived,
                _ => CourseStatusDomain.Draft
            };

            return CourseDomain.Rehydrate(
                id: c.Id,
                code: c.Code,
                title: c.Title,
                slug: c.Slug,
                subjectId: c.SubjectId,
                createdByUserId: c.CreatedByUserId,
                teacherId: c.TeacherId,
                sourceTemplateId: c.SourceTemplateId,
                gradeLevelId: c.GradeLevelId,
                categoryId: c.CategoryId,
                level: levelEnum,
                language: c.Language,
                totalLessons: c.TotalLessons ?? 0,
                totalDuration: c.TotalDuration ?? 0,
                status: statusEnum,
                isActive: c.IsActive ?? true,
                isTemplate: c.IsTemplate,
                createdAt: c.CreatedAt ?? DateTime.UtcNow,
                updatedAt: c.UpdatedAt,
                deletedAt: c.DeletedAt,
                description: c.Description,
                thumbnail: c.Thumbnail
            );
        }

        private static Course MapToEntity(CourseDomain d)
        {
            return new Course
            {
                Id = d.Id,
                Code = d.Code,
                Title = d.Title,
                Slug = d.Slug,
                Description = d.Description,
                Thumbnail = d.Thumbnail,
                SubjectId = d.SubjectId,
                GradeLevelId = d.GradeLevelId,
                CreatedByUserId = d.CreatedByUserId,
                TeacherId = d.TeacherId,
                CategoryId = d.CategoryId,
                Level = CourseLevelToString(d.Level), 
                Language = d.Language,
                TotalLessons = d.TotalLessons,
                TotalDuration = d.TotalDuration,
                Status = MapStatusToString(d.Status),
                IsActive = d.IsActive,
                IsTemplate = d.IsTemplate,
                SourceTemplateId = d.SourceTemplateId,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                DeletedAt = d.DeletedAt
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

        private static string CourseLevelToString(CourseLevelDomain level)
        {
            return level switch
            {
                CourseLevelDomain.Beginner => "Beginner",
                CourseLevelDomain.Intermediate => "Intermediate",
                CourseLevelDomain.Advanced => "Advanced",
                _ => "Beginner"
            };
        }

        public async Task<PagedResult<CourseDomain>> GetTeacherCoursesPagedAsync( Guid teacherId, int page,int pageSize, string? searchTerm, string? statusFilter, CancellationToken cancellationToken = default)
        {
            var query = _context.Courses
                .AsNoTracking()
                .Where(c => c.TeacherId == teacherId && c.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(c =>
                    c.Title.Contains(searchTerm) ||
                    c.Code.Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(statusFilter))
            {
                query = query.Where(c => c.Status == statusFilter);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var domains = items.Select(MapToDomain).ToList();

            return new PagedResult<CourseDomain>
            {
                Items = domains,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<PagedResult<CourseDomain>> GetCoursesPagedAsync(int page, int pageSize, string? searchTerm, string? statusFilter, Guid? subjectId,bool? isDeletedFilter, CancellationToken cancellationToken = default)
        {
            var query = _context.Courses.AsNoTracking().AsQueryable();

            if (isDeletedFilter.HasValue)
            {
                if (isDeletedFilter.Value)
                    query = query.Where(c => c.DeletedAt != null);
                else
                    query = query.Where(c => c.DeletedAt == null);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(c =>
                    c.Title.Contains(searchTerm) ||
                    c.Code.Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(statusFilter))
            {
                query = query.Where(c => c.Status == statusFilter);
            }

            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var domains = items.Select(MapToDomain).ToList();

            return new PagedResult<CourseDomain>
            {
                Items = domains,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<CourseDomain?> GetTemplateWithDetailsAsync(Guid templateId,CancellationToken cancellationToken = default)
        {
            var entity = await _context.Courses
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
                .FirstOrDefaultAsync(c =>
                    c.Id == templateId &&
                    c.IsTemplate == true &&
                    c.DeletedAt == null,
                    cancellationToken);

            if (entity == null)
                return null;

            var courseDomain = MapToDomain(entity);

            foreach (var sectionEntity in entity.Sections)
            {
                var sectionDomain = new SectionDomain(
                    sectionEntity.Id,
                    sectionEntity.CourseId,
                    sectionEntity.Title,
                    sectionEntity.Description,
                    sectionEntity.SortOrder,
                    sectionEntity.IsActive ?? true,
                    sectionEntity.CreatedAt ?? DateTime.UtcNow,
                    sectionEntity.UpdatedAt ?? DateTime.UtcNow
                );

                foreach (var lessonEntity in sectionEntity.Lessons)
                {
                    var lessonDomain = new LessonDomain(
                        lessonEntity.Id,
                        lessonEntity.SectionId,
                        lessonEntity.Title,
                        lessonEntity.Slug,
                        lessonEntity.VideoUrl,
                        lessonEntity.Content,
                        lessonEntity.SortOrder,
                        lessonEntity.Duration,
                        MapLessonStatusToEnum(lessonEntity.Status),
                        lessonEntity.IsPreview,
                        lessonEntity.IsActive,
                        lessonEntity.CreatedAt,
                        lessonEntity.UpdatedAt,
                        lessonEntity.DeletedAt
                    );

                    sectionDomain.Lessons.Add(lessonDomain);
                }

                courseDomain.AddSection(sectionDomain);
            }

            return courseDomain;
        }
        private static LessonStatusDomain MapLessonStatusToEnum(string? status)
        {
            return status switch
            {
                "Published" => LessonStatusDomain.Published,
                _ => LessonStatusDomain.Draft
            };
        }
    }
}