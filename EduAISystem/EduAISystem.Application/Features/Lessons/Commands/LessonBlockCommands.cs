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

    /// <summary>
    /// Yêu cầu AI sinh danh sách LessonBlock theo chuẩn sư phạm từ nội dung text/PDF.
    /// Lesson phải có CanUseAI = true. AI là optional – CRUD thủ công vẫn hoạt động.
    /// </summary>
    public record GenerateAiLessonBlocksCommand(Guid LessonId, GenerateAiLessonBlocksRequestDto Dto)
        : IRequest<GenerateAiLessonBlocksResult>;
}

