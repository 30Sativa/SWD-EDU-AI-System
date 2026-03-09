using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Notifications.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Notifications.Handler
{
    public class MarkNotificationAsReadCommandHandler
        : IRequestHandler<MarkNotificationAsReadCommand, Unit>
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly ICurrentUserService _currentUser;

        public MarkNotificationAsReadCommandHandler(
            INotificationRepository notificationRepository,
            ICurrentUserService currentUser)
        {
            _notificationRepository = notificationRepository;
            _currentUser = currentUser;
        }

        public async Task<Unit> Handle(
            MarkNotificationAsReadCommand request,
            CancellationToken cancellationToken)
        {
            var userId = _currentUser.UserId;

            if (userId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("User must be authenticated to mark notification as read.");
            }

            var notification = await _notificationRepository.GetByIdAsync(request.NotificationId, cancellationToken);

            if (notification == null)
            {
                throw new NotFoundException($"Notification with id {request.NotificationId} does not exist.");
            }

            if (notification.UserId != userId)
            {
                throw new ForbiddenException("You do not have permission to mark this notification as read.");
            }

            notification.MarkAsRead();
            await _notificationRepository.UpdateAsync(notification, cancellationToken);

            return Unit.Value;
        }
    }
}
