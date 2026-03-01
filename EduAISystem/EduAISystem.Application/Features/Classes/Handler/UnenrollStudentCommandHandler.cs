using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.Commands;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class UnenrollStudentCommandHandler : IRequestHandler<UnenrollStudentCommand, bool>
    {
        private readonly IClassRepository _classRepo;

        public UnenrollStudentCommandHandler(IClassRepository classRepo)
        {
            _classRepo = classRepo;
        }

        public async Task<bool> Handle(UnenrollStudentCommand request, CancellationToken cancellationToken)
        {
            return await _classRepo.RemoveStudentFromClassAsync(request.StudentUserId, request.ClassId, cancellationToken);
        }
    }
}
