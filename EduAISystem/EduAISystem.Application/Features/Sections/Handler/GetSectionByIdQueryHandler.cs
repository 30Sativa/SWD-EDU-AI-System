using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Sections.DTOs.Response;
using EduAISystem.Application.Features.Sections.Queries;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.Handler
{
    public class GetSectionByIdQueryHandler : IRequestHandler<GetSectionByIdQuery, SectionResponseDto>
    {
        private readonly ISectionRepository _sectionRepository;

        public GetSectionByIdQueryHandler(ISectionRepository sectionRepository)
        {
            _sectionRepository = sectionRepository;
        }

        public async Task<SectionResponseDto> Handle(GetSectionByIdQuery request, CancellationToken cancellationToken)
        {
            var section = await _sectionRepository.GetByIdAsync(request.SectionId)
                ?? throw new NotFoundException($"Section with ID {request.SectionId} not found.");

            return new SectionResponseDto
            {
                Id = section.Id,
                Title = section.Title,
                Description = section.Description ?? string.Empty,
                Order = section.SortOrder
            };
        }
    }
}

