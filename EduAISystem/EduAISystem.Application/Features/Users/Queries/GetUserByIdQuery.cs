using EduAISystem.Application.Features.Users.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Users.Queries
{
    public class GetUserByIdQuery : IRequest<UserDetailResponseDto?>
    {
        public Guid Id { get; set; }
    }
}
