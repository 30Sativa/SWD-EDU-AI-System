using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Notifications.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Notifications.Handler
{
    public class GetAdminBroadcastsQueryHandler
        : IRequestHandler<GetAdminBroadcastsQuery, PagedResult<AdminBroadcastSummaryModel>>
    {
        private readonly INotificationRepository _notificationRepository;

        public GetAdminBroadcastsQueryHandler(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<PagedResult<AdminBroadcastSummaryModel>> Handle(
            GetAdminBroadcastsQuery request, 
            CancellationToken cancellationToken)
        {
            return await _notificationRepository.GetAdminBroadcastSummariesPagedAsync(
                request.Page,
                request.PageSize,
                request.TitleFilter,
                request.FromDate,
                request.ToDate,
                cancellationToken);
        }
    }
}
