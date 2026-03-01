using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Notifications.Commands;
using EduAISystem.Application.Features.Notifications.DTOs.Response;
using EduAISystem.Application.Features.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NotificationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // =========================
        // GET MY NOTIFICATIONS
        // =========================
        [HttpGet("my")]
        [SwaggerOperation(
            Summary = "Danh sách thông báo của tôi",
            Description = "Lấy danh sách thông báo của người dùng hiện tại với phân trang và filter theo trạng thái đọc"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<NotificationListItemResponseDto>>))]
        public async Task<IActionResult> GetMyNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool? isRead = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(
                new GetMyNotificationsQuery(page, pageSize, isRead),
                cancellationToken);

            return Ok(ApiResponse<PagedResult<NotificationListItemResponseDto>>
                .Ok(result, "Lấy danh sách thông báo thành công"));
        }

        // =========================
        // GET UNREAD COUNT
        // =========================
        [HttpGet("unread-count")]
        [SwaggerOperation(
            Summary = "Số lượng thông báo chưa đọc",
            Description = "Lấy số lượng thông báo chưa đọc của người dùng hiện tại"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<int>))]
        public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetUnreadCountQuery(), cancellationToken);

            return Ok(ApiResponse<int>.Ok(result, "Lấy số lượng thông báo chưa đọc thành công"));
        }

        // =========================
        // MARK AS READ
        // =========================
        [HttpPut("{id:guid}/read")]
        [SwaggerOperation(
            Summary = "Đánh dấu thông báo đã đọc",
            Description = "Đánh dấu một thông báo cụ thể là đã đọc"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> MarkAsRead(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            await _mediator.Send(new MarkNotificationAsReadCommand(id), cancellationToken);

            return Ok(ApiResponse<object>.Ok(null, "Đánh dấu thông báo đã đọc thành công"));
        }

        // =========================
        // MARK ALL AS READ
        // =========================
        [HttpPut("mark-all-read")]
        [SwaggerOperation(
            Summary = "Đánh dấu tất cả thông báo đã đọc",
            Description = "Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken = default)
        {
            await _mediator.Send(new MarkAllNotificationsAsReadCommand(), cancellationToken);

            return Ok(ApiResponse<object>.Ok(null, "Đánh dấu tất cả thông báo đã đọc thành công"));
        }
    }
}
