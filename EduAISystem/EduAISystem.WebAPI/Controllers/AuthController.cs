using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Auth.Commands;
using EduAISystem.Application.Features.Auth.DTOs.Request;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _meditor;

        public AuthController(IMediator mediator)
        {
            _meditor = mediator;
        }

        [HttpPost("login")]
        [SwaggerOperation(
            Summary = "Đăng nhập",
            Description = "Xác thực thông tin đăng nhập và trả về JWT"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<LoginResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            var result = await _meditor.Send(new LoginCommand(dto));
            return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Login successfully"));
        }

        [HttpPost("register")]
        [SwaggerOperation(
            Summary = "Đăng ký người dùng",
            Description = "Tạo tài khoản mới và trả về thông tin đăng ký"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<RegisterResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> Register(RegisterRequestDto dto)
        {
            var result = await _meditor.Send(new RegisterCommand(dto));
            return Ok(ApiResponse<RegisterResponseDto>.Ok(result, "Register successfully"));
        }
    }
}
    