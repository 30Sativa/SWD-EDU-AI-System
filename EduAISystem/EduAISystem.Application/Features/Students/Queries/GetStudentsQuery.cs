using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Students.DTOs.Request;
using EduAISystem.Application.Features.Students.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Students.Queries
{
    public class GetStudentsQuery : StudentListRequestDto, IRequest<PagedResult<StudentListResponseDto>>
    {
    }
}
