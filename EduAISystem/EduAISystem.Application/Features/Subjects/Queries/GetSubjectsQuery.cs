using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Subjects.DTOs.Request;
using EduAISystem.Application.Features.Subjects.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Queries
{
    public class GetSubjectsQuery : SubjectListRequestDto, IRequest<PagedResult<SubjectListResponseDto>>
    {
    }
}
