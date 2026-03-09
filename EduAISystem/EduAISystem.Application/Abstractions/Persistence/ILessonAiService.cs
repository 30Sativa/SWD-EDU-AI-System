using EduAISystem.Application.Features.Lessons.DTOs.Response;

namespace EduAISystem.Application.Abstractions.Persistence
{
    /// <summary>
    /// EduVN AI – Dịch vụ AI chuyên sinh nội dung sư phạm chuẩn cho LessonBlock.
    /// Nhận đầu vào là văn bản (text gõ hoặc trích từ PDF/File)
    /// và trả về danh sách blocks được phân loại: Concept, Example, Exercise, Reflection.
    /// </summary>
    public interface ILessonAiService
    {
        /// <summary>
        /// Sinh blocks (non-streaming) – trả về toàn bộ kết quả sau khi hoàn thành.
        /// </summary>
        Task<List<GeneratedBlockDto>> GenerateBlocksAsync(
            string inputContent,
            string lessonTitle,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Sinh blocks (streaming) – trả về từng chunk text real-time qua IAsyncEnumerable.
        /// Client nhận data ngay khi AI bắt đầu sinh, không cần chờ toàn bộ.
        /// </summary>
        IAsyncEnumerable<string> GenerateBlocksStreamAsync(
            string inputContent,
            string lessonTitle,
            CancellationToken cancellationToken = default);
    }
}
