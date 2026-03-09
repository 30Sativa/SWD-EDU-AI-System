using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Subjects.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Handler
{
    public class SetSubjectStatusCommandHandler : IRequestHandler<SetSubjectStatusCommand, bool>
    {
        private readonly ISubjectRepository _subjectRepository;

        public SetSubjectStatusCommandHandler(ISubjectRepository subjectRepository)
        {
            _subjectRepository = subjectRepository;
        }

        public Task<bool> Handle(SetSubjectStatusCommand request, CancellationToken cancellationToken)
        {
            return _subjectRepository.SetActiveStatusAsync(request.Id, request.IsActive, cancellationToken);
        }
    }
}

