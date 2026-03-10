using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Notifications.Commands;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Notifications.Handler
{
    public class BroadcastNotificationCommandHandler : IRequestHandler<BroadcastNotificationCommand, Unit>
    {
        private readonly INotificationRepository _notifications;
        private readonly IUserRepository _users;
        private readonly IAuditService _auditService;

        public BroadcastNotificationCommandHandler(
            INotificationRepository notifications,
            IUserRepository users,
            IAuditService auditService)
        {
            _notifications = notifications;
            _users = users;
            _auditService = auditService;
        }

        public async Task<Unit> Handle(BroadcastNotificationCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;
            
            // Get user IDs by roles (null = all)
            List<int>? roleIds = dto.TargetRoles?.Select(r => (int)r).ToList();
            var userIds = await _users.GetUserIdsByRolesAsync(roleIds, true, cancellationToken);

            if (!userIds.Any())
                return Unit.Value;

            // Generate notification for each user
            var notificationEntities = userIds.Select(uid => new NotificationDomain(
                uid,
                NotificationTypeDomain.Announcement,
                dto.Title,
                dto.Message,
                dto.Link
            )).ToList();

            // Bulk Insert
            await _notifications.AddRangeAsync(notificationEntities, cancellationToken);

            _auditService.LogAction("BROADCAST_NOTIFICATION", "Notification", null, null, new { TargetRoles = dto.TargetRoles, UserCount = userIds.Count });

            return Unit.Value;
        }
    }
}
