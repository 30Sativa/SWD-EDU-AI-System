using EduAISystem.Application.Features.Users.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Users.Queries
{
    public record GetCurrentUserQuery(Guid UserId) : IRequest<UserDetailResponseDto>
    {
    }
}
