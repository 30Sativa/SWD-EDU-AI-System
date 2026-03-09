using MediatR;

namespace EduAISystem.Application.Features.Terms.Commands
{
    public class DeleteTermCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}

