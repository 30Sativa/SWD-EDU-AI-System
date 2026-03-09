using MediatR;
using System;

namespace EduAISystem.Application.Features.Sections.Commands
{
    public record DeleteSectionCommand(Guid SectionId) : IRequest
    {
    }
}

