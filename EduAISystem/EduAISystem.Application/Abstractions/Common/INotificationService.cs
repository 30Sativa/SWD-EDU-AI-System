using EduAISystem.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Common
{
    public interface INotificationService
    {
        /// <summary>
        /// Gửi thông báo đến một người dùng cụ thể (Lưu DB + Gửi qua SignalR nếu đang online)
        /// </summary>
        Task SendNotificationAsync(
            Guid userId,
            NotificationTypeDomain type,
            string title,
            string message,
            string? link = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Gửi thông báo hàng loạt (Lưu DB + SignalR)
        /// </summary>
        Task SendBatchNotificationAsync(
            IEnumerable<Guid> userIds,
            NotificationTypeDomain type,
            string title,
            string message,
            string? link = null,
            CancellationToken cancellationToken = default);
    }
}
