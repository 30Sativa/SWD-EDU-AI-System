using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Terms.Commands;
using EduAISystem.Application.Features.Terms.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Handler
{
    public class UpdateTermCommandHandler : IRequestHandler<UpdateTermCommand, TermDetailResponseDto?>
    {
        private readonly ITermRepository _terms;

        public UpdateTermCommandHandler(ITermRepository terms)
        {
            _terms = terms;
        }

        public async Task<TermDetailResponseDto?> Handle(UpdateTermCommand request, CancellationToken cancellationToken)
        {
            var existing = await _terms.GetByIdAsync(request.Id, cancellationToken);
            if (existing == null)
                return null;

            existing.Update(request.Request.Name, request.Request.StartDate, request.Request.EndDate);

            // Optional business rule: prevent overlapping terms if needed (not enforced now)

            await _terms.UpdateAsync(existing, cancellationToken);

            return new TermDetailResponseDto
            {
                Id = existing.Id,
                Code = existing.Code,
                Name = existing.Name,
                StartDate = existing.StartDate,
                EndDate = existing.EndDate,
                IsActive = existing.IsActive,
                CreatedAt = existing.CreatedAt
            };
        }
    }
}

