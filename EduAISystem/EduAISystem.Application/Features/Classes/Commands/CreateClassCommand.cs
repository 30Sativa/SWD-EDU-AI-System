using EduAISystem.Application.Features.Classes.DTOs.Request;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Commands
{
    public class CreateClassCommand : IRequest<ClassDetailResponseDto>
    {
        public CreateClassRequestDto Request { get; set; } = null!;
    }
}

