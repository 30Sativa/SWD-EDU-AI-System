using EduAISystem.Application.Common.Models;
using MediatR;
using System;

namespace EduAISystem.Application.Features.Notifications.Queries
{
    /// <summary>
    /// Lấy danh sách thông báo Admin đã gửi (gộp nhóm theo Title+Message+Link+Thời gian).
    /// Thay vì hiển thị mỗi user 1 bản ghi → chỉ hiển thị 1 thông báo cho 1 lần gửi.
    /// </summary>
    public record GetAdminBroadcastsQuery(
        int Page = 1,
        int PageSize = 10,
        string? TitleFilter = null,
        DateTime? FromDate = null,
        DateTime? ToDate = null)
        : IRequest<PagedResult<AdminBroadcastSummaryModel>>;
}
