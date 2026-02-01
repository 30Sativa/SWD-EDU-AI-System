using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Users.DTOs.Response;
using EduAISystem.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduAISystem.WebAPI.Controllers.Admin
{
    [Route("api/admin/users")]

    [ApiController]
    public class UserAccountsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UserAccountsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] ListUsersQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<UserListResponseDto>>.Ok(result, "Lấy danh sách người dùng có phân trang"));
        }

    }
}
