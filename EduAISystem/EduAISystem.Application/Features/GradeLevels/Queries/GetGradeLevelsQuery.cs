using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.GradeLevels.DTOs.Request;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Queries
{
    public class GetGradeLevelsQuery : GradeLevelListRequestDto, IRequest<PagedResult<GradeLevelListResponseDto>>
    {
    }
}

