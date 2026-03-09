using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.CourseCategories.Commands;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Handler
{
    public class CreateCourseCategoryCommandHandler : IRequestHandler<CreateCourseCategoryCommand, CourseCategoryDetailResponseDto>
    {
        private readonly ICourseCategoryRepository _categories;

        public CreateCourseCategoryCommandHandler(ICourseCategoryRepository categories)
        {
            _categories = categories;
        }

        public async Task<CourseCategoryDetailResponseDto> Handle(CreateCourseCategoryCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;
            var category = CourseCategoryDomain.Create(dto.Name, dto.Description, dto.ParentId, dto.IconUrl, dto.SortOrder);

            await _categories.AddAsync(category, cancellationToken);

            // reload to ensure ParentName is present if any
            var saved = await _categories.GetByIdAsync(category.Id, cancellationToken) ?? category;

            return new CourseCategoryDetailResponseDto
            {
                Id = saved.Id,
                Name = saved.Name,
                Slug = saved.Slug,
                Description = saved.Description,
                ParentId = saved.ParentId,
                ParentName = saved.ParentName,
                IconUrl = saved.IconUrl,
                SortOrder = saved.SortOrder,
                IsActive = saved.IsActive,
                CreatedAt = saved.CreatedAt,
                UpdatedAt = saved.UpdatedAt
            };
        }
    }
}

