namespace EduAISystem.Application.Features.Lessons.DTOs.Response
{
    /// <summary>
    /// Kết quả trả về sau khi AI sinh xong nội dung blocks.
    /// </summary>
    public class GenerateAiLessonBlocksResult
    {
        /// <summary>Lesson đã dùng AI để sinh blocks</summary>
        public Guid LessonId { get; set; }

        /// <summary>
        /// Danh sách blocks được AI sinh ra.
        /// Nếu SaveToDB=false, đây chỉ là preview và chưa được lưu.
        /// </summary>
        public List<GeneratedBlockDto> GeneratedBlocks { get; set; } = new();

        /// <summary>
        /// Các ID của blocks đã được lưu vào DB (chỉ có giá trị nếu SaveToDB=true).
        /// </summary>
        public List<Guid> SavedBlockIds { get; set; } = new();

        /// <summary>true nếu kết quả đã được lưu vào DB</summary>
        public bool IsSaved { get; set; }

        /// <summary>Nguồn đầu vào AI đã dùng: 'Text', 'PDF', 'File'</summary>
        public string InputSourceType { get; set; } = null!;

        /// <summary>Số lượng blocks được sinh ra</summary>
        public int TotalBlocks => GeneratedBlocks.Count;
    }
}
