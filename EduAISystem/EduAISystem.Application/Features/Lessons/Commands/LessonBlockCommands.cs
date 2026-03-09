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
    /// Preview sẽ được cache tự động 30 phút.
    /// </summary>
    public record GenerateAiLessonBlocksCommand(Guid LessonId, GenerateAiLessonBlocksRequestDto Dto)
        : IRequest<GenerateAiLessonBlocksResult>;

    /// <summary>
    /// Lấy AI preview đã cache (nếu còn hạn).
    /// Dùng khi teacher refresh trang hoặc muốn xem lại preview.
    /// </summary>
    public record GetAiPreviewQuery(Guid LessonId) : IRequest<GenerateAiLessonBlocksResult?>;

    /// <summary>
    /// Lưu blocks từ AI preview vào DB.
    /// Teacher có thể chỉnh sửa content/blockType trước khi gửi.
    /// Sau khi save thành công, preview sẽ bị xoá khỏi cache.
    /// </summary>
    public record SaveAiPreviewCommand(Guid LessonId, SaveAiPreviewRequestDto Dto) : IRequest<List<Guid>>;
}


