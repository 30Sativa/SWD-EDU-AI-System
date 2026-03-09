using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.GradeLevels.Commands;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Handler
{
    public class CreateGradeLevelCommandHandler : IRequestHandler<CreateGradeLevelCommand, GradeLevelDetailResponseDto>
    {
        private readonly IGradeLevelRepository _gradeLevels;

        public CreateGradeLevelCommandHandler(IGradeLevelRepository gradeLevels)
        {
            _gradeLevels = gradeLevels;
        }

        public async Task<GradeLevelDetailResponseDto> Handle(CreateGradeLevelCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var gradeLevel = GradeLevelDomain.Create(dto.Code, dto.Name, dto.SortOrder);
            await _gradeLevels.AddAsync(gradeLevel, cancellationToken);

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

