using MediatR;

namespace EduAISystem.Application.Features.Classes.Commands
{
    public class SetClassStatusCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public bool IsActive { get; set; }
    }
}

