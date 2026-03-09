using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Dashboards.DTOs.Response;
using EduAISystem.Application.Features.Dashboards.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Admin
{
    [Route("api/admin/dashboard")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class DashboardsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Thống kê Dashboard cho Admin/Manager")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AdminDashboardResponseDto>))]
        public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAdminDashboardStatsQuery(), cancellationToken);
            return Ok(ApiResponse<AdminDashboardResponseDto>.Ok(result, "Lấy thống kê thành công"));
        }
    }
}
