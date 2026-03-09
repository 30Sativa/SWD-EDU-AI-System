using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Dashboards.DTOs.Response;
using EduAISystem.Application.Features.Dashboards.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/dashboard")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class DashboardsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public DashboardsController(IMediator mediator, ICurrentUserService currentUserService)
        {
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Thống kê Dashboard cho Student")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StudentDashboardResponseDto>))]
        public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
        {
            var studentId = _currentUserService.UserId;
            var result = await _mediator.Send(new GetStudentDashboardStatsQuery(studentId), cancellationToken);
            return Ok(ApiResponse<StudentDashboardResponseDto>.Ok(result, "Lấy thống kê thành công"));
        }
    }
}
