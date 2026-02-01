using MediatR;

namespace EduAISystem.Application.Features.Users.Commands
{
    public class SoftDeleteUserCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}
