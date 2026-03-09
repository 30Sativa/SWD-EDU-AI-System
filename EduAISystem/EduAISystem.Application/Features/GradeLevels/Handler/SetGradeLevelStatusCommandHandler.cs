using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.GradeLevels.Commands;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Handler
{
    public class SetGradeLevelStatusCommandHandler : IRequestHandler<SetGradeLevelStatusCommand, bool>
    {
        private readonly IGradeLevelRepository _gradeLevels;

        public SetGradeLevelStatusCommandHandler(IGradeLevelRepository gradeLevels)
        {
            _gradeLevels = gradeLevels;
        }

        public Task<bool> Handle(SetGradeLevelStatusCommand request, CancellationToken cancellationToken)
        {
            return _gradeLevels.SetActiveStatusAsync(request.Id, request.IsActive, cancellationToken);
        }
    }
}

