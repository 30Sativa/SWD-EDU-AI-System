using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.Commands;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class AssignSubjectTeacherCommandHandler : IRequestHandler<AssignSubjectTeacherCommand, bool>
    {
        private readonly ITeacherAssignmentRepository _assignmentRepo;

        public AssignSubjectTeacherCommandHandler(ITeacherAssignmentRepository assignmentRepo)
        {
            _assignmentRepo = assignmentRepo;
        }

        public async Task<bool> Handle(AssignSubjectTeacherCommand request, CancellationToken cancellationToken)
        {
            await _assignmentRepo.AssignSubjectTeacherAsync(
                request.ClassId, 
                request.SubjectId, 
                request.TeacherId, 
                cancellationToken);

            return true;
        }
    }
}
