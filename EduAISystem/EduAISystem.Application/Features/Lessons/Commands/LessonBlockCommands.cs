using EduAISystem.Application.Features.Lessons.DTOs.Request;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Lessons.Commands
{
    public record GetLessonBlocksQuery(Guid LessonId) : IRequest<List<LessonBlockResponseDto>>;

    public record GetLessonBlockByIdQuery(Guid Id) : IRequest<LessonBlockResponseDto?>;

    public record CreateLessonBlockCommand(Guid LessonId, CreateLessonBlockRequestDto Dto) : IRequest<Guid>;

    public record UpdateLessonBlockCommand(Guid Id, UpdateLessonBlockRequestDto Dto) : IRequest<bool>;

    public record DeleteLessonBlockCommand(Guid Id) : IRequest<bool>;
}
