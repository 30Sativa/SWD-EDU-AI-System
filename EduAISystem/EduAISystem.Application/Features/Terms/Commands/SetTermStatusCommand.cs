using MediatR;

namespace EduAISystem.Application.Features.Terms.Commands
{
    public class SetTermStatusCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public bool IsActive { get; set; }
    }
}

