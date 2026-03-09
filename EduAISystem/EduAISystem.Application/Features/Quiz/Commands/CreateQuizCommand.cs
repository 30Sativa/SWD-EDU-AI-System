using EduAISystem.Application.Features.Quiz.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Quiz.Commands
{
    public record CreateQuizCommand(CreateQuizRequestDto Request) : IRequest<Guid>
    {
    }
}
