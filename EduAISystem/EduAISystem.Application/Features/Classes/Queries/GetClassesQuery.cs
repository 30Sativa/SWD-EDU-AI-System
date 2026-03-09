using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Classes.DTOs.Request;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Queries
{
    public class GetClassesQuery : ClassListRequestDto, IRequest<PagedResult<ClassListResponseDto>>
    {
    }
}

