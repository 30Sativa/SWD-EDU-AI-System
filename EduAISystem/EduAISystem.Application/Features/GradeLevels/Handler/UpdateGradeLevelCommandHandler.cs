using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.GradeLevels.Commands;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Handler
{
    public class UpdateGradeLevelCommandHandler : IRequestHandler<UpdateGradeLevelCommand, GradeLevelDetailResponseDto?>
    {
        private readonly IGradeLevelRepository _gradeLevels;

        public UpdateGradeLevelCommandHandler(IGradeLevelRepository gradeLevels)
        {
            _gradeLevels = gradeLevels;
        }

        public async Task<GradeLevelDetailResponseDto?> Handle(UpdateGradeLevelCommand request, CancellationToken cancellationToken)
        {
            var existing = await _gradeLevels.GetByIdAsync(request.Id, cancellationToken);
            if (existing == null)
                return null;

            existing.Update(request.Request.Name, request.Request.SortOrder);
            await _gradeLevels.UpdateAsync(existing, cancellationToken);

            return new GradeLevelDetailResponseDto
            {
                Id = existing.Id,
                Code = existing.Code,
                Name = existing.Name,
                SortOrder = existing.SortOrder,
                IsActive = existing.IsActive,
                CreatedAt = existing.CreatedAt
            };
        }
    }
}

