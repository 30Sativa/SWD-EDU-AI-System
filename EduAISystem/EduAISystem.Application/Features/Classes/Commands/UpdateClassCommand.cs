using EduAISystem.Application.Features.Classes.DTOs.Request;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Commands
{
    public class UpdateClassCommand : IRequest<ClassDetailResponseDto?>
    {
        public Guid Id { get; set; }
        public UpdateClassRequestDto Request { get; set; } = null!;
    }
}

