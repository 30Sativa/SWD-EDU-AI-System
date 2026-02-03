using EduAISystem.Application.Features.GradeLevels.DTOs.Request;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Commands
{
    public class CreateGradeLevelCommand : IRequest<GradeLevelDetailResponseDto>
    {
        public CreateGradeLevelRequestDto Request { get; set; } = null!;
    }
}

