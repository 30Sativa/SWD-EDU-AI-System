using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.CourseCategories.DTOs.Request;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Queries
{
    public class GetCourseCategoriesQuery : CourseCategoryListRequestDto, IRequest<PagedResult<CourseCategoryListResponseDto>>
    {
    }
}

