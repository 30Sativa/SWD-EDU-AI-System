using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly EduAiDbV5Context _context;

        public NotificationRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<NotificationDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Notifications
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

            return entity == null ? null : MapToDomain(entity);
        }

        // =========================
        // ADD
        // =========================
        public async Task AddAsync(NotificationDomain notification, CancellationToken cancellationToken = default)
        {
            var entity = MapToEntity(notification);
            _context.Notifications.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // =========================
        // ADD RANGE
        // =========================
        public async Task AddRangeAsync(IEnumerable<NotificationDomain> notifications, CancellationToken cancellationToken = default)
        {
            var entities = notifications.Select(MapToEntity).ToList();
            _context.Notifications.AddRange(entities);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // =========================
        // UPDATE
        // =========================
        public async Task UpdateAsync(NotificationDomain notification, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notification.Id, cancellationToken);

            if (entity == null)
                return;

            entity.IsRead = notification.IsRead;
            entity.ReadAt = notification.ReadAt;
            entity.Title = notification.Title;
            entity.Message = notification.Message;
            entity.Link = notification.Link;
            entity.Type = MapTypeToString(notification.Type);

            await _context.SaveChangesAsync(cancellationToken);
        }

        // =========================
        // GET PAGED BY USER
        // =========================
        public async Task<PagedResult<NotificationDomain>> GetPagedByUserAsync(
            Guid userId,
            int page,
            int pageSize,
            bool? isRead = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Notifications
                .AsNoTracking()
                .Where(n => n.UserId == userId);

            if (isRead.HasValue)
            {
                query = query.Where(n => n.IsRead == isRead.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var domains = entities.Select(MapToDomain).ToList();

            return new PagedResult<NotificationDomain>
            {
                Items = domains,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        // =========================
        // GET UNREAD COUNT
        // =========================
        public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .AsNoTracking()
                .CountAsync(n => n.UserId == userId && n.IsRead == false, cancellationToken);
        }

        // =========================
        // MARK ALL AS READ
        // =========================
        public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead == false)
                .ToListAsync(cancellationToken);

            var now = DateTime.UtcNow;
            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = now;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        // =========================
        // PRIVATE MAPPERS
        // =========================

        private static Notification MapToEntity(NotificationDomain d)
        {
            return new Notification
            {
                Id = d.Id,
                UserId = d.UserId,
                Type = MapTypeToString(d.Type),
                Title = d.Title,
                Message = d.Message,
                Link = d.Link,
                IsRead = d.IsRead,
                ReadAt = d.ReadAt,
                CreatedAt = d.CreatedAt
            };
        }

        private static NotificationDomain MapToDomain(Notification n)
        {
            return NotificationDomain.Load(
                n.Id,
                n.UserId,
                MapTypeToEnum(n.Type),
                n.Title,
                n.Message,
                n.Link,
                n.IsRead ?? false,
                n.CreatedAt ?? DateTime.UtcNow,
                n.ReadAt
            );
        }

        private static string MapTypeToString(NotificationTypeDomain type)
        {
            return type switch
            {
                NotificationTypeDomain.CoursePublished => "CoursePublished",
                NotificationTypeDomain.AssignmentDue => "AssignmentDue",
                NotificationTypeDomain.AssignmentGraded => "AssignmentGraded",
                NotificationTypeDomain.CourseEnrolled => "CourseEnrolled",
                NotificationTypeDomain.CourseCompleted => "CourseCompleted",
                NotificationTypeDomain.LessonCompleted => "LessonCompleted",
                NotificationTypeDomain.GradePosted => "GradePosted",
                NotificationTypeDomain.Announcement => "Announcement",
                NotificationTypeDomain.System => "System",
                _ => "System"
            };
        }

        private static NotificationTypeDomain MapTypeToEnum(string? type)
        {
            return type switch
            {
                "CoursePublished" => NotificationTypeDomain.CoursePublished,
                "AssignmentDue" => NotificationTypeDomain.AssignmentDue,
                "AssignmentGraded" => NotificationTypeDomain.AssignmentGraded,
                "CourseEnrolled" => NotificationTypeDomain.CourseEnrolled,
                "CourseCompleted" => NotificationTypeDomain.CourseCompleted,
                "LessonCompleted" => NotificationTypeDomain.LessonCompleted,
                "GradePosted" => NotificationTypeDomain.GradePosted,
                "Announcement" => NotificationTypeDomain.Announcement,
                "System" => NotificationTypeDomain.System,
                _ => NotificationTypeDomain.System
            };
        }
    }
}
