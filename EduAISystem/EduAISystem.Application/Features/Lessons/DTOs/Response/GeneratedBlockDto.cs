namespace EduAISystem.Application.Features.Lessons.DTOs.Response
{
    /// <summary>
    /// Một block nội dung được AI sinh ra (chưa lưu vào DB).
    /// </summary>
    public class GeneratedBlockDto
    {
        /// <summary>Loại block: 'Concept', 'Example', 'Exercise', 'Reflection'</summary>
        public string BlockType { get; set; } = null!;

        /// <summary>Nội dung sư phạm đã được AI chuẩn hóa</summary>
        public string Content { get; set; } = null!;

        /// <summary>Thứ tự hiển thị trong lesson</summary>
        public int SortOrder { get; set; }

        /// <summary>Thời gian đọc/học ước tính (phút)</summary>
        public int? EstimatedMinutes { get; set; }
    }
}
