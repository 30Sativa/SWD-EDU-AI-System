using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Notifications.Commands;
using EduAISystem.Application.Features.Notifications.DTOs.Request;
using EduAISystem.Application.Features.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.WebAPI.Controllers.Admin
{
    [Route("api/admin/notifications")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Using standard Roles claim
    public class NotificationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NotificationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "Admin - Gửi thông báo hàng loạt",
            Description = "Admin soạn nội dung thông báo. Backend sẽ gửi thông báo đến tất cả người dùng thuộc nhóm Role đã chọn (hoặc tất cả nếu để trống)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Broadcast([FromBody] AdminBroadcastNotificationRequestDto dto, CancellationToken cancellationToken)
        {
            await _mediator.Send(new BroadcastNotificationCommand(dto), cancellationToken);

            return Ok(ApiResponse<object>.Ok(null, "Đã gửi thông báo thành công đến tất cả đối tượng liên quan."));
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Admin - Xem lịch sử thông báo đã gửi",
            Description = "Lấy danh sách các lần Admin đã gửi thông báo (gộp nhóm), mỗi lần gửi chỉ hiện 1 dòng kèm số lượng người nhận và role nào nhận."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<AdminBroadcastSummaryModel>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetBroadcasts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? title = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(
                new GetAdminBroadcastsQuery(page, pageSize, title, fromDate, toDate),
                cancellationToken);
            return Ok(ApiResponse<PagedResult<AdminBroadcastSummaryModel>>.Ok(result, "Lấy danh sách thông báo đã gửi thành công."));
        }
    }
}
