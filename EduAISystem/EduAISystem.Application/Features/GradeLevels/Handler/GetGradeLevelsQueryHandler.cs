using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using EduAISystem.Application.Features.GradeLevels.Queries;
using MediatR;

namespace EduAISystem.Application.Features.GradeLevels.Handler
{
    public class GetGradeLevelsQueryHandler : IRequestHandler<GetGradeLevelsQuery, PagedResult<GradeLevelListResponseDto>>
    {
        private readonly IGradeLevelRepository _gradeLevelRepository;

        public GetGradeLevelsQueryHandler(IGradeLevelRepository gradeLevelRepository)
        {
            _gradeLevelRepository = gradeLevelRepository;
        }

        public async Task<PagedResult<GradeLevelListResponseDto>> Handle(GetGradeLevelsQuery request, CancellationToken cancellationToken)
        {
            var result = await _gradeLevelRepository.GetGradeLevelsPagedAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.IsActiveFilter,
                cancellationToken);

            var items = result.Items.Select(g => new GradeLevelListResponseDto
            {
                Id = g.Id,
                Code = g.Code,
                Name = g.Name,
                SortOrder = g.SortOrder,
                IsActive = g.IsActive
            }).ToList();

            return new PagedResult<GradeLevelListResponseDto>
            {
                Items = items,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }
    }
}

