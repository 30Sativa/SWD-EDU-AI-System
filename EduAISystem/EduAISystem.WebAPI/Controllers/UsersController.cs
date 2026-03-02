using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Users.Commands;
using EduAISystem.Application.Features.Users.DTOs.Request;
using EduAISystem.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Swashbuckle.AspNetCore.Annotations;

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
        [SwaggerOperation(
            Summary = "Lấy thông tin người dùng hiện tại",
            Description = "Đọc userId từ JWT và trả về thông tin cá nhân"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse<object>))]
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

        [HttpPut("me/profile")]
        [Authorize]
        [SwaggerOperation(
            Summary = "Cập nhật thông tin cá nhân",
            Description = "Chỉ update các field được truyền (null = giữ nguyên)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.Fail("Không tìm thấy UserId trong token"));

            var result = await _mediator.Send(new UpdateUserProfileCommand
            {
                UserId = Guid.Parse(userId),
                Request = dto
            });

            return Ok(ApiResponse<object>.Ok(result, "Cập nhật thông tin cá nhân thành công"));
        }
    }
}
