using EduAISystem.Application.Features.Auth.DTOs.Request;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Auth.Commands
{
    public record GoogleLoginCommand(GoogleLoginRequestDto Request) : IRequest<LoginResponseDto>;
}
