using EduAISystem.Application.Features.Sections.DTOs.Request;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.Commands
{
    public record UpdateSectionCommand(Guid SectionId, UpdateSectionRequestDto Request) : IRequest
    {
    }
}
