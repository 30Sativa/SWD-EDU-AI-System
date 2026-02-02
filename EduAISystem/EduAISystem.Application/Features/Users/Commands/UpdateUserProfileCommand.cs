using EduAISystem.Application.Features.Users.DTOs.Request;
using EduAISystem.Application.Features.Users.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Users.Commands
{
    public class UpdateUserProfileCommand : IRequest<UserDetailResponseDto?>
    {
        public Guid UserId { get; set; }
        public UpdateUserProfileRequestDto Request { get; set; } = null!;
    }
}
