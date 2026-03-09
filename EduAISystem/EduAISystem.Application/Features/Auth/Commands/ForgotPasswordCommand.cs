using EduAISystem.Application.Features.Auth.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Auth.Commands
{
    /// <summary>Gửi email chứa link reset password</summary>
    public record ForgotPasswordCommand(ForgotPasswordRequestDto Request) : IRequest<Unit>;
}
