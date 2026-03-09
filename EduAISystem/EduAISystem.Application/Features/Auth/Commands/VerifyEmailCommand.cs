using EduAISystem.Application.Features.Auth.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Auth.Commands
{
    /// <summary>Xác nhận email sau khi đăng ký (click link trong email)</summary>
    public record VerifyEmailCommand(VerifyEmailRequestDto Request) : IRequest<Unit>;
}
