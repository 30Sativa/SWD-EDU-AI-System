using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace EduAISystem.Infrastructure.Services.Cache
{
    /// <summary>
    /// MemoryCache implementation cho AI preview blocks.
    /// Preview tự hết hạn sau 30 phút.
    /// 
    /// Nếu cần scale nhiều server → chuyển sang Redis IDistributedCache.
    /// </summary>
    public class AiPreviewCacheService : IAiPreviewCacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<AiPreviewCacheService> _logger;

        /// <summary>Thời gian preview tồn tại trong cache (30 phút)</summary>
        private static readonly TimeSpan PreviewTTL = TimeSpan.FromMinutes(30);

        public AiPreviewCacheService(
            IMemoryCache cache,
            ILogger<AiPreviewCacheService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        private static string CacheKey(Guid lessonId) => $"ai-preview:{lessonId}";

        public Task SavePreviewAsync(Guid lessonId, GenerateAiLessonBlocksResult preview)
        {
            var key = CacheKey(lessonId);
            _cache.Set(key, preview, PreviewTTL);
            _logger.LogInformation(
                "[Cache] 💾 Lưu preview {BlockCount} blocks cho Lesson {LessonId} (TTL: {TTL} phút)",
                preview.TotalBlocks, lessonId, PreviewTTL.TotalMinutes);
            return Task.CompletedTask;
        }

        public Task<GenerateAiLessonBlocksResult?> GetPreviewAsync(Guid lessonId)
        {
            var key = CacheKey(lessonId);
            var found = _cache.TryGetValue(key, out GenerateAiLessonBlocksResult? preview);

            if (found)
                _logger.LogInformation("[Cache] ✅ Hit preview Lesson {LessonId}", lessonId);
            else
                _logger.LogInformation("[Cache] ❌ Miss preview Lesson {LessonId} (hết hạn hoặc chưa generate)", lessonId);

            return Task.FromResult(found ? preview : null);
        }

        public Task RemovePreviewAsync(Guid lessonId)
        {
            var key = CacheKey(lessonId);
            _cache.Remove(key);
            _logger.LogInformation("[Cache] 🗑️ Xoá preview Lesson {LessonId}", lessonId);
            return Task.CompletedTask;
        }
    }
}
