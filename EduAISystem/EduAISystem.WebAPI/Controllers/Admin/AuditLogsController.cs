using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.AuditLogs.DTOs.Response;
using EduAISystem.Application.Features.AuditLogs.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.WebAPI.Controllers.Admin
{
    [Route("api/admin/audit-logs")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuditLogsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Lấy danh sách nhật ký hệ thống (Audit Logs)",
            Description = "Lấy toàn bộ nhật ký hệ thống kèm phân trang và bộ lọc theo Action, Entity, UserId"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<AuditLogResponseDto>>))]
        public async Task<IActionResult> GetPagedAuditLogs([FromQuery] GetAuditLogPagedListQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<AuditLogResponseDto>>.Ok(result, "Lấy danh sách nhật ký thành công"));
        }

        [HttpGet("recent")]
        [SwaggerOperation(
            Summary = "Lấy các nhật ký gần đây",
            Description = "Lấy top n nhật ký mới nhất để hiển thị tại Dashboard widget"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<AuditLogResponseDto>>))]
        public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int count = 5, CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetRecentAuditLogsQuery { Count = count }, cancellationToken);
            return Ok(ApiResponse<List<AuditLogResponseDto>>.Ok(result, "Lấy nhật ký gần đây thành công"));
        }
    }
}
