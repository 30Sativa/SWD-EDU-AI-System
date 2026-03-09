using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Terms.Commands;
using EduAISystem.Application.Features.Terms.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Handler
{
    public class CreateTermCommandHandler : IRequestHandler<CreateTermCommand, TermDetailResponseDto>
    {
        private readonly ITermRepository _terms;

        public CreateTermCommandHandler(ITermRepository terms)
        {
            _terms = terms;
        }

        public async Task<TermDetailResponseDto> Handle(CreateTermCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var codeExists = await _terms.CodeExistsAsync(dto.Code, null, cancellationToken);
            if (codeExists)
            {
                throw new ConflictException("Mã kỳ học đã tồn tại.");
            }

            var term = TermDomain.Create(dto.Code, dto.Name, dto.StartDate, dto.EndDate);
            await _terms.AddAsync(term, cancellationToken);

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

