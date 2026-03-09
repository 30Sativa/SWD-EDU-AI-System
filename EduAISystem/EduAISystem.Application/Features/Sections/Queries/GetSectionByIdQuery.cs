using EduAISystem.Application.Features.Sections.DTOs.Response;
using MediatR;
using System;

namespace EduAISystem.Application.Features.Sections.Queries
{
    public record GetSectionByIdQuery(Guid SectionId) : IRequest<SectionResponseDto>
    {
    }
}

