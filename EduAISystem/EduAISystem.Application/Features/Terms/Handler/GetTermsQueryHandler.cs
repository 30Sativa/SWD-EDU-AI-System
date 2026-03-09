using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Terms.DTOs.Response;
using EduAISystem.Application.Features.Terms.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Handler
{
    public class GetTermsQueryHandler : IRequestHandler<GetTermsQuery, PagedResult<TermListResponseDto>>
    {
        private readonly ITermRepository _terms;

        public GetTermsQueryHandler(ITermRepository terms)
        {
            _terms = terms;
        }

        public async Task<PagedResult<TermListResponseDto>> Handle(GetTermsQuery request, CancellationToken cancellationToken)
        {
            var result = await _terms.GetTermsPagedAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.IsActiveFilter,
                request.FromStartDate,
                request.ToEndDate,
                cancellationToken);

            var items = result.Items.Select(t => new TermListResponseDto
            {
                Id = t.Id,
                Code = t.Code,
                Name = t.Name,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                IsActive = t.IsActive,
                CreatedAt = t.CreatedAt
            }).ToList();

            return new PagedResult<TermListResponseDto>
            {
                Items = items,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }
    }
}

