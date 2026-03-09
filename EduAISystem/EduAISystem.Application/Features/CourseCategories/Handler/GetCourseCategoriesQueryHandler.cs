using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using EduAISystem.Application.Features.CourseCategories.Queries;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Handler
{
    public class GetCourseCategoriesQueryHandler : IRequestHandler<GetCourseCategoriesQuery, PagedResult<CourseCategoryListResponseDto>>
    {
        private readonly ICourseCategoryRepository _categories;

        public GetCourseCategoriesQueryHandler(ICourseCategoryRepository categories)
        {
            _categories = categories;
        }

        public async Task<PagedResult<CourseCategoryListResponseDto>> Handle(GetCourseCategoriesQuery request, CancellationToken cancellationToken)
        {
            var result = await _categories.GetCourseCategoriesPagedAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.IsActiveFilter,
                request.ParentId,
                cancellationToken);

            var items = result.Items.Select(c => new CourseCategoryListResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                ParentId = c.ParentId,
                ParentName = c.ParentName,
                SortOrder = c.SortOrder,
                IsActive = c.IsActive
            }).ToList();

            return new PagedResult<CourseCategoryListResponseDto>
            {
                Items = items,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }
    }
}

