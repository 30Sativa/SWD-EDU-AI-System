using EduAISystem.Application.Features.Lessons.DTOs.Request;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Lessons.Commands
{
    public record GetLessonFaqsQuery(Guid LessonId) : IRequest<List<LessonFaqResponseDto>>;

    public record GetLessonFaqByIdQuery(Guid Id) : IRequest<LessonFaqResponseDto?>;

    public record CreateLessonFaqCommand(Guid LessonId, CreateLessonFaqRequestDto Dto) : IRequest<Guid>;

    public record UpdateLessonFaqCommand(Guid Id, UpdateLessonFaqRequestDto Dto) : IRequest<bool>;

    public record DeleteLessonFaqCommand(Guid Id) : IRequest<bool>;
}
