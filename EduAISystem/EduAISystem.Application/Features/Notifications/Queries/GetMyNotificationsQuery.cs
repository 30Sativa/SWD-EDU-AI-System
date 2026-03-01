using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Notifications.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Notifications.Queries
{
    public record GetMyNotificationsQuery(
        int Page = 1,
        int PageSize = 10,
        bool? IsRead = null)
        : IRequest<PagedResult<NotificationListItemResponseDto>>;
}
