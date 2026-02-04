using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Classes.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class DeleteClassCommandHandler : IRequestHandler<DeleteClassCommand, bool>
    {
        private readonly IClassRepository _classes;

        public DeleteClassCommandHandler(IClassRepository classes)
        {
            _classes = classes;
        }

        public async Task<bool> Handle(DeleteClassCommand request, CancellationToken cancellationToken)
        {
            try
            {
                return await _classes.DeleteAsync(request.Id, cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new ConflictException(ex.Message);
            }
        }
    }
}

