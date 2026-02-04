using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.CourseCategories.Commands;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Handler
{
    public class UpdateCourseCategoryCommandHandler : IRequestHandler<UpdateCourseCategoryCommand, CourseCategoryDetailResponseDto?>
    {
        private readonly ICourseCategoryRepository _categories;

        public UpdateCourseCategoryCommandHandler(ICourseCategoryRepository categories)
        {
            _categories = categories;
        }

        public async Task<CourseCategoryDetailResponseDto?> Handle(UpdateCourseCategoryCommand request, CancellationToken cancellationToken)
        {
            var existing = await _categories.GetByIdAsync(request.Id, cancellationToken);
            if (existing == null)
                return null;

            var dto = request.Request;
            var name = dto.Name ?? existing.Name;
            var description = dto.Description ?? existing.Description;
            var parentId = dto.ParentId ?? existing.ParentId;
            var iconUrl = dto.IconUrl ?? existing.IconUrl;
            var sortOrder = dto.SortOrder ?? existing.SortOrder;

            existing.Update(name, description, parentId, iconUrl, sortOrder);
            await _categories.UpdateAsync(existing, cancellationToken);

            var updated = await _categories.GetByIdAsync(existing.Id, cancellationToken) ?? existing;

            return new CourseCategoryDetailResponseDto
            {
                Id = updated.Id,
                Name = updated.Name,
                Slug = updated.Slug,
                Description = updated.Description,
                ParentId = updated.ParentId,
                ParentName = updated.ParentName,
                IconUrl = updated.IconUrl,
                SortOrder = updated.SortOrder,
                IsActive = updated.IsActive,
                CreatedAt = updated.CreatedAt,
                UpdatedAt = updated.UpdatedAt
            };
        }
    }
}

