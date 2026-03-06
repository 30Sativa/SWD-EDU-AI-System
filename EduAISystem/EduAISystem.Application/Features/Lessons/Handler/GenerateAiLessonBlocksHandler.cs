using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    /// <summary>
    /// Handler xử lý lệnh sinh LessonBlocks bằng AI từ nội dung text/PDF.
    ///
    /// Luồng hoạt động:
    ///  1. Kiểm tra lesson tồn tại và có CanUseAI = true
    ///  2. Gọi ILessonAiService để sinh blocks theo chuẩn sư phạm
    ///  3. Nếu SaveToDB = true → lưu hàng loạt vào DB và trả về IDs
    ///  4. Nếu SaveToDB = false → chỉ trả về preview để giáo viên review
    ///
    /// AI là OPTIONAL: nếu CanUseAI = false, giáo viên vẫn có thể dùng CRUD thủ công.
    /// </summary>
    public class GenerateAiLessonBlocksHandler
        : IRequestHandler<GenerateAiLessonBlocksCommand, GenerateAiLessonBlocksResult>
    {
        private readonly ILessonBlockRepository _blockRepo;
        private readonly ILessonRepository _lessonRepo;
        private readonly ILessonAiService _lessonAiService;

        public GenerateAiLessonBlocksHandler(
            ILessonBlockRepository blockRepo,
            ILessonRepository lessonRepo,
            ILessonAiService lessonAiService)
        {
            _blockRepo = blockRepo;
            _lessonRepo = lessonRepo;
            _lessonAiService = lessonAiService;
        }

        public async Task<GenerateAiLessonBlocksResult> Handle(
            GenerateAiLessonBlocksCommand request,
            CancellationToken cancellationToken)
        {
            // 1. Kiểm tra lesson có tồn tại không
            var lesson = await _lessonRepo.GetByIdAsync(request.LessonId);
            if (lesson == null)
                throw new NotFoundException($"Lesson với id {request.LessonId} không tồn tại.");

            // 2. Kiểm tra lesson có bật quyền dùng AI không
            if (lesson.CanUseAI != true)
                throw new InvalidOperationException(
                    $"Lesson '{lesson.Title}' không được bật tính năng AI (CanUseAI = false). " +
                    "Vui lòng bật CanUseAI trước khi sử dụng tính năng này, " +
                    "hoặc tạo block thủ công qua endpoint POST /blocks.");

            // 3. Xác định tiêu đề bài học cho AI sử dụng làm context
            var lessonTitle = !string.IsNullOrWhiteSpace(request.Dto.LessonTitle)
                ? request.Dto.LessonTitle
                : lesson.Title;

            // 4. Gọi AI service để sinh nội dung sư phạm
            var generatedBlocks = await _lessonAiService.GenerateBlocksAsync(
                request.Dto.InputContent,
                lessonTitle,
                cancellationToken);

            if (generatedBlocks == null || generatedBlocks.Count == 0)
                throw new InvalidOperationException("AI không sinh được nội dung blocks. Vui lòng thử lại với nội dung khác.");

            var result = new GenerateAiLessonBlocksResult
            {
                LessonId = request.LessonId,
                GeneratedBlocks = generatedBlocks,
                InputSourceType = request.Dto.InputSourceType,
                IsSaved = false
            };

            // 5. Nếu giáo viên yêu cầu lưu ngay → persist vào DB
            if (request.Dto.SaveToDB)
            {
                var blockTuples = generatedBlocks
                    .Select(b => (b.BlockType, b.Content, b.SortOrder, b.EstimatedMinutes))
                    .ToList();

                var savedIds = await _blockRepo.AddAiGeneratedBatchAsync(
                    request.LessonId,
                    blockTuples,
                    request.Dto.InputSourceType,
                    cancellationToken);

                result.SavedBlockIds = savedIds;
                result.IsSaved = true;
            }

            return result;
        }
    }
}
