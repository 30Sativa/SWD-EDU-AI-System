using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface INotificationRepository
    {
        Task<NotificationDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(NotificationDomain notification, CancellationToken cancellationToken = default);
        Task AddRangeAsync(IEnumerable<NotificationDomain> notifications, CancellationToken cancellationToken = default);
        Task UpdateAsync(NotificationDomain notification, CancellationToken cancellationToken = default);
        Task<PagedResult<NotificationDomain>> GetPagedByUserAsync(
            Guid userId, 
            int page, 
            int pageSize, 
            bool? isRead = null, 
            CancellationToken cancellationToken = default);
        Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
        Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
