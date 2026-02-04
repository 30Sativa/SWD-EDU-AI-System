using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Terms.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Handler
{
    public class DeleteTermCommandHandler : IRequestHandler<DeleteTermCommand, bool>
    {
        private readonly ITermRepository _terms;

        public DeleteTermCommandHandler(ITermRepository terms)
        {
            _terms = terms;
        }

        public async Task<bool> Handle(DeleteTermCommand request, CancellationToken cancellationToken)
        {
            try
            {
                return await _terms.DeleteAsync(request.Id, cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new ConflictException(ex.Message);
            }
        }
    }
}

