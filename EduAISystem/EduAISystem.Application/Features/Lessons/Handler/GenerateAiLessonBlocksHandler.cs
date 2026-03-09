using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    /// <summary>
    /// Handler xử lý lệnh sinh LessonBlocks bằng AI từ nội dung text/PDF.
    ///
    /// Luồng hoạt động (v2 – có cache + logging):
    ///  1. Kiểm tra lesson tồn tại và có CanUseAI = true
    ///  2. Gọi ILessonAiService để sinh blocks theo chuẩn sư phạm
    ///  3. Cache preview tự động 30 phút (teacher refresh không mất)
    ///  4. Nếu SaveToDB = true → lưu hàng loạt vào DB và xoá cache
    ///  5. Nếu SaveToDB = false → trả về preview để giáo viên review/edit
    ///
    /// AI là OPTIONAL: nếu CanUseAI = false, giáo viên vẫn có thể dùng CRUD thủ công.
    /// </summary>
    public class GenerateAiLessonBlocksHandler
        : IRequestHandler<GenerateAiLessonBlocksCommand, GenerateAiLessonBlocksResult>
    {
        private readonly ILessonBlockRepository _blockRepo;
        private readonly ILessonRepository _lessonRepo;
        private readonly ILessonAiService _lessonAiService;
        private readonly IAiPreviewCacheService _previewCache;
        private readonly ILogger<GenerateAiLessonBlocksHandler> _logger;

        public GenerateAiLessonBlocksHandler(
            ILessonBlockRepository blockRepo,
            ILessonRepository lessonRepo,
            ILessonAiService lessonAiService,
            IAiPreviewCacheService previewCache,
            ILogger<GenerateAiLessonBlocksHandler> logger)
        {
            _blockRepo = blockRepo;
            _lessonRepo = lessonRepo;
            _lessonAiService = lessonAiService;
            _previewCache = previewCache;
            _logger = logger;
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

            _logger.LogInformation(
                "[Handler] Bắt đầu generate AI blocks • LessonId: {LessonId} • Title: \"{Title}\" • SaveToDB: {SaveToDB}",
                request.LessonId, lessonTitle, request.Dto.SaveToDB);

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

            // 5. Lưu preview vào cache (30 phút) để teacher có thể refresh/review
            await _previewCache.SavePreviewAsync(request.LessonId, result);

            // 6. Nếu giáo viên yêu cầu lưu ngay → persist vào DB + xoá cache
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

                // Xoá cache preview vì đã save rồi
                await _previewCache.RemovePreviewAsync(request.LessonId);

                _logger.LogInformation(
                    "[Handler] ✅ Đã save {Count} AI blocks vào DB • LessonId: {LessonId}",
                    savedIds.Count, request.LessonId);
            }
            else
            {
                _logger.LogInformation(
                    "[Handler] 👁️ Preview {Count} AI blocks (chưa save) • LessonId: {LessonId}",
                    generatedBlocks.Count, request.LessonId);
            }

            return result;
        }
    }

    /// <summary>
    /// Handler lấy AI preview từ cache.
    /// Dùng khi teacher refresh trang hoặc muốn xem lại preview đã generate.
    /// </summary>
    public class GetAiPreviewHandler : IRequestHandler<GetAiPreviewQuery, GenerateAiLessonBlocksResult?>
    {
        private readonly IAiPreviewCacheService _previewCache;

        public GetAiPreviewHandler(IAiPreviewCacheService previewCache)
        {
            _previewCache = previewCache;
        }

        public async Task<GenerateAiLessonBlocksResult?> Handle(
            GetAiPreviewQuery request, CancellationToken cancellationToken)
        {
            return await _previewCache.GetPreviewAsync(request.LessonId);
        }
    }

    /// <summary>
    /// Handler lưu blocks từ AI preview vào DB.
    /// Teacher có thể chỉnh sửa nội dung, loại block, thứ tự, hoặc bỏ bớt blocks
    /// trước khi gửi request save.
    /// Sau khi save → xoá cache preview.
    /// </summary>
    public class SaveAiPreviewHandler : IRequestHandler<SaveAiPreviewCommand, List<Guid>>
    {
        private readonly ILessonBlockRepository _blockRepo;
        private readonly ILessonRepository _lessonRepo;
        private readonly IAiPreviewCacheService _previewCache;
        private readonly ILogger<SaveAiPreviewHandler> _logger;

        public SaveAiPreviewHandler(
            ILessonBlockRepository blockRepo,
            ILessonRepository lessonRepo,
            IAiPreviewCacheService previewCache,
            ILogger<SaveAiPreviewHandler> logger)
        {
            _blockRepo = blockRepo;
            _lessonRepo = lessonRepo;
            _previewCache = previewCache;
            _logger = logger;
        }

        public async Task<List<Guid>> Handle(SaveAiPreviewCommand request, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra lesson tồn tại
            var lessonExists = await _blockRepo.LessonExistsAsync(request.LessonId, cancellationToken);
            if (!lessonExists)
                throw new NotFoundException($"Lesson với id {request.LessonId} không tồn tại.");

            // 2. Xác định inputSourceType — ưu tiên từ request, fallback từ cache
            var inputSourceType = request.Dto.InputSourceType;
            if (string.IsNullOrWhiteSpace(inputSourceType))
            {
                var cachedPreview = await _previewCache.GetPreviewAsync(request.LessonId);
                inputSourceType = cachedPreview?.InputSourceType ?? "Text";
            }

            // 3. Lưu blocks đã chỉnh sửa vào DB
            var blockTuples = request.Dto.Blocks
                .Select(b => (b.BlockType, b.Content, b.SortOrder, b.EstimatedMinutes))
                .ToList();

            var savedIds = await _blockRepo.AddAiGeneratedBatchAsync(
                request.LessonId,
                blockTuples,
                inputSourceType,
                cancellationToken);

            // 4. Xoá cache preview
            await _previewCache.RemovePreviewAsync(request.LessonId);

            _logger.LogInformation(
                "[Handler] ✅ Save preview: {Count} blocks (đã edit) → DB • LessonId: {LessonId} • Types: [{Types}]",
                savedIds.Count, request.LessonId,
                string.Join(", ", request.Dto.Blocks.Select(b => b.BlockType)));

            return savedIds;
        }
    }
}
