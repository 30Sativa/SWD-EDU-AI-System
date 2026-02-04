using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class SetClassStatusCommandHandler : IRequestHandler<SetClassStatusCommand, bool>
    {
        private readonly IClassRepository _classes;

        public SetClassStatusCommandHandler(IClassRepository classes)
        {
            _classes = classes;
        }

        public async Task<bool> Handle(SetClassStatusCommand request, CancellationToken cancellationToken)
        {
            return await _classes.SetActiveStatusAsync(request.Id, request.IsActive, cancellationToken);
        }
    }
}

