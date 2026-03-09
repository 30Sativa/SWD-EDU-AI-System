using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Terms.DTOs.Request;
using EduAISystem.Application.Features.Terms.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Queries
{
    public class GetTermsQuery : TermListRequestDto, IRequest<PagedResult<TermListResponseDto>>
    {
    }
}

