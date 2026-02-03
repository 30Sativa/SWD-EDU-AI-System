using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduAISystem.WebAPI.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.Fail("Không tìm thấy UserId trong token"));
            var result = await _mediator.Send(
                new GetCurrentUserQuery(Guid.Parse(userId))
            );

            return Ok(ApiResponse<object>.Ok(result, "Lấy thông tin người dùng hiện tại thành công"));
        }
    }
}
