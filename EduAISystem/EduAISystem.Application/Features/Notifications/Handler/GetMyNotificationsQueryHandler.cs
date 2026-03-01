using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Notifications.DTOs.Response;
using EduAISystem.Application.Features.Notifications.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Notifications.Handler
{
    public class GetMyNotificationsQueryHandler
        : IRequestHandler<GetMyNotificationsQuery, PagedResult<NotificationListItemResponseDto>>
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly ICurrentUserService _currentUser;

        public GetMyNotificationsQueryHandler(
            INotificationRepository notificationRepository,
            ICurrentUserService currentUser)
        {
            _notificationRepository = notificationRepository;
            _currentUser = currentUser;
        }

        public async Task<PagedResult<NotificationListItemResponseDto>> Handle(
            GetMyNotificationsQuery request,
            CancellationToken cancellationToken)
        {
            var userId = _currentUser.UserId;

            if (userId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("User must be authenticated to view notifications.");
            }

            var notifications = await _notificationRepository.GetPagedByUserAsync(
                userId,
                request.Page,
                request.PageSize,
                request.IsRead,
                cancellationToken);

            var items = notifications.Items.Select(n => new NotificationListItemResponseDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                Link = n.Link,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                CreatedAt = n.CreatedAt
            }).ToList();

            return new PagedResult<NotificationListItemResponseDto>
            {
                Items = items,
                TotalCount = notifications.TotalCount,
                Page = notifications.Page,
                PageSize = notifications.PageSize
            };
        }
    }
}
