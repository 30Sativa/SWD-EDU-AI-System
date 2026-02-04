using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Terms.DTOs.Response;
using EduAISystem.Application.Features.Terms.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Handler
{
    public class GetTermByIdQueryHandler : IRequestHandler<GetTermByIdQuery, TermDetailResponseDto?>
    {
        private readonly ITermRepository _terms;

        public GetTermByIdQueryHandler(ITermRepository terms)
        {
            _terms = terms;
        }

        public async Task<TermDetailResponseDto?> Handle(GetTermByIdQuery request, CancellationToken cancellationToken)
        {
            var term = await _terms.GetByIdAsync(request.Id, cancellationToken);
            if (term == null)
                return null;

            return new TermDetailResponseDto
            {
                Id = term.Id,
                Code = term.Code,
                Name = term.Name,
                StartDate = term.StartDate,
                EndDate = term.EndDate,
                IsActive = term.IsActive,
                CreatedAt = term.CreatedAt
            };
        }
    }
}

