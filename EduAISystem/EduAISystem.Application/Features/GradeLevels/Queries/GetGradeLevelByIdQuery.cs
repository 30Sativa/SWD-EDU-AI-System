using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Queries
{
    public class GetGradeLevelByIdQuery : IRequest<GradeLevelDetailResponseDto?>
    {
        public Guid Id { get; set; }
    }
}

