using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Auth.Commands;
using EduAISystem.Application.Features.Auth.DTOs.Request;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            var result = await _meditor.Send(new LoginCommand(dto));
            return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Login successfully"));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestDto dto)
        {
            var result = await _meditor.Send(new RegisterCommand(dto));
            return Ok(ApiResponse<RegisterResponseDto>.Ok(result, "Register successfully"));
        }
    }
}
