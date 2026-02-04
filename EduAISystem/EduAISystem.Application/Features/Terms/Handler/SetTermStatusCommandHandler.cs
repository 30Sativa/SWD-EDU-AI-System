using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Terms.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Handler
{
    public class SetTermStatusCommandHandler : IRequestHandler<SetTermStatusCommand, bool>
    {
        private readonly ITermRepository _terms;

        public SetTermStatusCommandHandler(ITermRepository terms)
        {
            _terms = terms;
        }

        public async Task<bool> Handle(SetTermStatusCommand request, CancellationToken cancellationToken)
        {
            return await _terms.SetActiveStatusAsync(request.Id, request.IsActive, cancellationToken);
        }
    }
}

