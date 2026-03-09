using MediatR;

namespace EduAISystem.Application.Features.Classes.Commands
{
    public class DeleteClassCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}

