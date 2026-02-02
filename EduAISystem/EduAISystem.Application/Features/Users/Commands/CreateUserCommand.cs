using EduAISystem.Application.Features.Users.DTOs.Request;
using EduAISystem.Application.Features.Users.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Users.Commands
{
    public class CreateUserCommand : IRequest<UserDetailResponseDto>
    {
        public CreateUserRequestDto Request { get; set; } = null!;
    }
}
