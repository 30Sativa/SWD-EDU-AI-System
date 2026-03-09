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

        // =============================================
        // LOGIN THƯỜNG (Email + Password)
        // =============================================
        [HttpPost("login")]
        [SwaggerOperation(
            Summary = "Đăng nhập",
            Description = "Xác thực thông tin đăng nhập và trả về JWT. Yêu cầu email đã được xác nhận."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<LoginResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            var result = await _meditor.Send(new LoginCommand(dto));
            return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Login successfully"));
        }

        // =============================================
        // LOGIN BẰNG GOOGLE
        // =============================================
        [HttpPost("google-login")]
        [SwaggerOperation(
            Summary = "Đăng nhập / Đăng ký bằng Google",
            Description = @"
Nhận id_token từ Google Sign-In phía frontend.

**Luồng frontend:**
1. User click 'Sign in with Google'
2. Google SDK trả về id_token
3. Frontend POST id_token về endpoint này
4. Backend verify và trả về JWT

Nếu user chưa có tài khoản → tự động tạo mới (mặc định role Student).
Nếu đã có tài khoản email trùng → link Google vào tài khoản đó."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<LoginResponseDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestDto dto)
        {
            var result = await _meditor.Send(new GoogleLoginCommand(dto));
            return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Google login successfully"));
        }

        // =============================================
        // ĐĂNG KÝ (tự đăng ký qua email)
        // =============================================
        [HttpPost("register")]
        [SwaggerOperation(
            Summary = "Đăng ký tài khoản",
            Description = @"
Tạo tài khoản mới. Sau khi đăng ký:
1. Hệ thống gửi email xác nhận đến địa chỉ email đã đăng ký
2. User phải click link trong email để kích hoạt tài khoản
3. Sau khi xác nhận mới có thể đăng nhập

Link xác nhận có hiệu lực trong **24 giờ**."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<RegisterResponseDto>))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            var result = await _meditor.Send(new RegisterCommand(dto));
            return Ok(ApiResponse<RegisterResponseDto>.Ok(result, "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản."));
        }

        // =============================================
        // XÁC NHẬN EMAIL (sau khi click link)
        // =============================================
        [HttpPost("verify-email")]
        [SwaggerOperation(
            Summary = "Xác nhận email đăng ký",
            Description = @"
Xác nhận email bằng token nhận được trong link email.

**Luồng:**
1. User click link: `{frontend}/verify-email?token=abc123`
2. Frontend lấy token từ URL params
3. Frontend POST token về endpoint này
4. Backend kích hoạt tài khoản
5. User có thể đăng nhập"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequestDto dto)
        {
            await _meditor.Send(new VerifyEmailCommand(dto));
            return Ok(ApiResponse<object>.Ok(null, "Email xác nhận thành công! Bạn có thể đăng nhập."));
        }

        // =============================================
        // QUÊN MẬT KHẨU (gửi link về email)
        // =============================================
        [HttpPost("forgot-password")]
        [SwaggerOperation(
            Summary = "Quên mật khẩu",
            Description = @"
Gửi link đặt lại mật khẩu về email nếu tài khoản tồn tại.

**Bảo mật:** API luôn trả về thành công dù email có tồn tại hay không
(tránh lộ thông tin tài khoản - enumeration attack).

Link có hiệu lực trong **30 phút**."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
        {
            await _meditor.Send(new ForgotPasswordCommand(dto));
            return Ok(ApiResponse<object>.Ok(null, "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu."));
        }

        // =============================================
        // ĐẶT LẠI MẬT KHẨU (sau khi click link email)
        // =============================================
        [HttpPost("reset-password")]
        [SwaggerOperation(
            Summary = "Đặt lại mật khẩu",
            Description = @"
Đặt lại mật khẩu mới bằng token nhận được trong link email.

**Luồng:**
1. User click link: `{frontend}/reset-password?token=abc123`
2. Frontend hiển thị form nhập mật khẩu mới
3. Frontend POST token + mật khẩu mới về endpoint này
4. Backend xác thực token và cập nhật mật khẩu"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
        {
            await _meditor.Send(new ResetPasswordCommand(dto));
            return Ok(ApiResponse<object>.Ok(null, "Đặt lại mật khẩu thành công! Vui lòng đăng nhập."));
        }

        // =============================================
        // LÀM MỚI ACCESS TOKEN
        // =============================================
        [HttpPost("refresh-token")]
        [SwaggerOperation(
            Summary = "Làm mới Access Token",
            Description = "Dùng Refresh Token hợp lệ (chưa hết hạn, chưa bị thu hồi) để lấy JWT/Access Token mới và Refresh Token mới."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<LoginResponseDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            var result = await _meditor.Send(new RefreshTokenCommand(dto));
            return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Token refreshed successfully."));
        }
    }
}