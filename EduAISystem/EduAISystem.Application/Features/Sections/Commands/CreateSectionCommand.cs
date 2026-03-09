using EduAISystem.Application.Features.Sections.DTOs.Request;
using EduAISystem.Application.Features.Sections.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Sections.Commands
{
    public record CreateSectionCommand(Guid CourseId, CreateSectionRequestDto Request) : IRequest<SectionResponseDto>
    {
    }
}
