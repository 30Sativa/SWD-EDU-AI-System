using EduAISystem.Application.Features.GradeLevels.DTOs.Request;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Commands
{
    public class UpdateGradeLevelCommand : IRequest<GradeLevelDetailResponseDto?>
    {
        public Guid Id { get; set; }
        public UpdateGradeLevelRequestDto Request { get; set; } = null!;
    }
}

