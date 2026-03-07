using EduAISystem.Application.Features.Lessons.DTOs.Response;

namespace EduAISystem.Application.Abstractions.Persistence
{
    /// <summary>
    /// Cache service cho AI-generated preview blocks.
    /// Cho phép giáo viên review, chỉnh sửa, rồi mới lưu vào DB.
    /// Preview tự động hết hạn sau TTL (mặc định 30 phút).
    /// </summary>
    public interface IAiPreviewCacheService
    {
        /// <summary>
        /// Lưu preview blocks vào cache.
        /// Key = lessonId → mỗi lesson chỉ cache 1 preview tại một thời điểm.
        /// </summary>
        Task SavePreviewAsync(Guid lessonId, GenerateAiLessonBlocksResult preview);

        /// <summary>
        /// Lấy preview đã cache (nếu còn hạn).
        /// </summary>
        Task<GenerateAiLessonBlocksResult?> GetPreviewAsync(Guid lessonId);

        /// <summary>
        /// Xoá preview khỏi cache (sau khi đã save hoặc teacher hủy).
        /// </summary>
        Task RemovePreviewAsync(Guid lessonId);
    }
}
