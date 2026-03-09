using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Features.Notifications.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Notifications.Handler
{
    public class MarkAllNotificationsAsReadCommandHandler
        : IRequestHandler<MarkAllNotificationsAsReadCommand, Unit>
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly ICurrentUserService _currentUser;

        public MarkAllNotificationsAsReadCommandHandler(
            INotificationRepository notificationRepository,
            ICurrentUserService currentUser)
        {
            _notificationRepository = notificationRepository;
            _currentUser = currentUser;
        }

        public async Task<Unit> Handle(
            MarkAllNotificationsAsReadCommand request,
            CancellationToken cancellationToken)
        {
            var userId = _currentUser.UserId;

            if (userId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("User must be authenticated to mark all notifications as read.");
            }

            await _notificationRepository.MarkAllAsReadAsync(userId, cancellationToken);

            return Unit.Value;
        }
    }
}
