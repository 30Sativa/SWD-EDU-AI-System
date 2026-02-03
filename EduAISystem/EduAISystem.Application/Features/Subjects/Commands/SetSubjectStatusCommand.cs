using MediatR;

namespace EduAISystem.Application.Features.Subjects.Commands
{
    public class SetSubjectStatusCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public bool IsActive { get; set; }
    }
}

