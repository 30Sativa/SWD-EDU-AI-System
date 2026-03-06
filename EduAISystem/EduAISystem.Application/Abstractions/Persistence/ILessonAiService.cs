using EduAISystem.Application.Features.Lessons.DTOs.Response;

namespace EduAISystem.Application.Abstractions.Persistence
{
    /// <summary>
    /// Dịch vụ AI chuyên sinh nội dung sư phạm chuẩn cho LessonBlock.
    /// Nhận đầu vào là văn bản (text gõ hoặc trích từ PDF/File)
    /// và trả về danh sách blocks được phân loại: Concept, Example, Exercise, Reflection.
    /// </summary>
    public interface ILessonAiService
    {
        /// <summary>
        /// Phân tích nội dung đầu vào và sinh ra các LessonBlock theo chuẩn sư phạm.
        /// </summary>
        /// <param name="inputContent">Văn bản nội dung bài học (trích từ PDF, DOCX hay text giáo viên nhập)</param>
        /// <param name="lessonTitle">Tiêu đề bài học để AI hiểu ngữ cảnh</param>
        /// <returns>Danh sách GeneratedBlockDto đã phân loại theo BlockType</returns>
        Task<List<GeneratedBlockDto>> GenerateBlocksAsync(
            string inputContent,
            string lessonTitle,
            CancellationToken cancellationToken = default);
    }
}
