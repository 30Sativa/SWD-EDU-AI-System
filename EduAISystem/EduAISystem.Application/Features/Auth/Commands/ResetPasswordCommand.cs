using EduAISystem.Application.Features.Auth.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Auth.Commands
{
    /// <summary>Đặt lại mật khẩu bằng token trong link email</summary>
    public record ResetPasswordCommand(ResetPasswordRequestDto Request) : IRequest<Unit>;
}
