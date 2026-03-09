using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Subjects.DTOs.Response;
using EduAISystem.Application.Features.Subjects.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Handler
{
    public class GetSubjectsQueryHandler : IRequestHandler<GetSubjectsQuery, PagedResult<SubjectListResponseDto>>
    {
        private readonly ISubjectRepository _subjectRepository;

        public GetSubjectsQueryHandler(ISubjectRepository subjectRepository)
        {
            _subjectRepository = subjectRepository;
        }

        public async Task<PagedResult<SubjectListResponseDto>> Handle(GetSubjectsQuery request, CancellationToken cancellationToken)
        {
            var result = await _subjectRepository.GetSubjectsPagedAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.IsActiveFilter,
                cancellationToken);

            var items = result.Items.Select(s => new SubjectListResponseDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                NameEn = s.NameEn,
                Description = s.Description,
                IconUrl = s.IconUrl,
                Color = s.Color,
                SortOrder = s.SortOrder,
                IsActive = s.IsActive
            }).ToList();

            return new PagedResult<SubjectListResponseDto>
            {
                Items = items,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }
    }
}

