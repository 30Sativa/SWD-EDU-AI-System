using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Services.Notifications
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(
            INotificationRepository notificationRepository,
            IHubContext<NotificationHub> hubContext)
        {
            _notificationRepository = notificationRepository;
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(
            Guid userId,
            NotificationTypeDomain type,
            string title,
            string message,
            string? link = null,
            CancellationToken cancellationToken = default)
        {
            if (!EduAISystem.Application.Common.Helpers.SystemFeaturesConfig.IsEventNotificationEnabled)
                return;
            // 1. Lưu vào Database
            var notification = new NotificationDomain(userId, type, title, message, link);
            await _notificationRepository.AddAsync(notification, cancellationToken);

            // 2. Gửi Real-time qua SignalR
            // Clients.User(id) dựa trên NameIdentifier claim trong Token
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
            {
                notification.Id,
                Type = type.ToString(),
                notification.Title,
                notification.Message,
                notification.Link,
                notification.CreatedAt,
                notification.IsRead
            }, cancellationToken);
        }

        public async Task SendBatchNotificationAsync(
            IEnumerable<Guid> userIds,
            NotificationTypeDomain type,
            string title,
            string message,
            string? link = null,
            CancellationToken cancellationToken = default)
        {
            if (!EduAISystem.Application.Common.Helpers.SystemFeaturesConfig.IsEventNotificationEnabled)
                return;

            var ids = userIds.ToList();
            if (!ids.Any()) return;

            // 1. Lưu Bulk vào Database
            var notifications = ids.Select(uid => new NotificationDomain(uid, type, title, message, link)).ToList();
            await _notificationRepository.AddRangeAsync(notifications, cancellationToken);

            // 2. Gửi Real-time qua SignalR cho từng người
            foreach (var userId in ids)
            {
                await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
                {
                    Type = type.ToString(),
                    Title = title,
                    Message = message,
                    Link = link,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                }, cancellationToken);
            }
        }
    }
}
