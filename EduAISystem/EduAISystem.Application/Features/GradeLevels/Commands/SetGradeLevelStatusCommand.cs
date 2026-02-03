using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Commands
{
    public class SetGradeLevelStatusCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public bool IsActive { get; set; }
    }
}

