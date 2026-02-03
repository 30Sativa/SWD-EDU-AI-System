using EduAISystem.Application.Features.Sections.DTOs.Request;
using EduAISystem.Application.Features.Sections.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.Commands
{
    public record CreateSectionCommand(Guid CourseId, CreateSectionRequestDto Request) : IRequest<SectionResponseDto>
    {
    }
}
