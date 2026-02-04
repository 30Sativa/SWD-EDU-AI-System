using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.DTOs.Request;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Queries
{
    public class GetCoursesQuery : CourseListRequestDto, IRequest<PagedResult<CourseListItemResponseDto>>
    {
    }
}

