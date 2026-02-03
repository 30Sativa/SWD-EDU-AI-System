using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using EduAISystem.Application.Features.GradeLevels.Queries;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Handler
{
    public class GetGradeLevelByIdQueryHandler : IRequestHandler<GetGradeLevelByIdQuery, GradeLevelDetailResponseDto?>
    {
        private readonly IGradeLevelRepository _gradeLevelRepository;

        public GetGradeLevelByIdQueryHandler(IGradeLevelRepository gradeLevelRepository)
        {
            _gradeLevelRepository = gradeLevelRepository;
        }

        public async Task<GradeLevelDetailResponseDto?> Handle(GetGradeLevelByIdQuery request, CancellationToken cancellationToken)
        {
            var gradeLevel = await _gradeLevelRepository.GetByIdAsync(request.Id, cancellationToken);
            if (gradeLevel == null)
                return null;

            return new GradeLevelDetailResponseDto
            {
                Id = gradeLevel.Id,
                Code = gradeLevel.Code,
                Name = gradeLevel.Name,
                SortOrder = gradeLevel.SortOrder,
                IsActive = gradeLevel.IsActive,
                CreatedAt = gradeLevel.CreatedAt
            };
        }
    }
}

