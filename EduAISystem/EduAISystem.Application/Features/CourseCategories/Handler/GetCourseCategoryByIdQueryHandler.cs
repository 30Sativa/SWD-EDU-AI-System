using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using EduAISystem.Application.Features.CourseCategories.Queries;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Handler
{
    public class GetCourseCategoryByIdQueryHandler : IRequestHandler<GetCourseCategoryByIdQuery, CourseCategoryDetailResponseDto?>
    {
        private readonly ICourseCategoryRepository _categories;

        public GetCourseCategoryByIdQueryHandler(ICourseCategoryRepository categories)
        {
            _categories = categories;
        }

        public async Task<CourseCategoryDetailResponseDto?> Handle(GetCourseCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var category = await _categories.GetByIdAsync(request.Id, cancellationToken);
            if (category == null)
                return null;

            return new CourseCategoryDetailResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                ParentId = category.ParentId,
                ParentName = category.ParentName,
                IconUrl = category.IconUrl,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };
        }
    }
}

