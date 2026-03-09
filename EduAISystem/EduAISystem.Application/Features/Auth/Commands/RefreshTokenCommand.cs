using EduAISystem.Application.Features.Auth.DTOs.Request;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Auth.Commands
{
    public class RefreshTokenCommand : IRequest<LoginResponseDto>
    {
        public RefreshTokenRequestDto Request { get; set; }

        public RefreshTokenCommand(RefreshTokenRequestDto request)
        {
            Request = request;
        }
    }
}
