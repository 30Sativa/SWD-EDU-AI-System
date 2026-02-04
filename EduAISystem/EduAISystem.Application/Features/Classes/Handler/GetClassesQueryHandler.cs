using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Application.Features.Classes.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class GetClassesQueryHandler : IRequestHandler<GetClassesQuery, PagedResult<ClassListResponseDto>>
    {
        private readonly IClassRepository _classes;

        public GetClassesQueryHandler(IClassRepository classes)
        {
            _classes = classes;
        }

        public async Task<PagedResult<ClassListResponseDto>> Handle(GetClassesQuery request, CancellationToken cancellationToken)
        {
            var result = await _classes.GetClassesPagedAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.IsActiveFilter,
                request.TermId,
                request.TeacherId,
                request.GradeLevelId,
                cancellationToken);

            var items = result.Items.Select(c => new ClassListResponseDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                TeacherId = c.TeacherId,
                TermId = c.TermId,
                GradeLevelId = c.GradeLevelId,
                MaxStudents = c.MaxStudents,
                CurrentStudents = c.CurrentStudents,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            }).ToList();

            return new PagedResult<ClassListResponseDto>
            {
                Items = items,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }
    }
}

