using System.ComponentModel.DataAnnotations;

namespace EduAISystem.Application.Features.Lessons.DTOs.Request
{
    /// <summary>
    /// DTO để giáo viên yêu cầu AI sinh nội dung block từ text hoặc file.
    /// Lesson phải có CanUseAI = true để sử dụng tính năng này.
    /// </summary>
    public class GenerateAiLessonBlocksRequestDto
    {
        /// <summary>
        /// Nguồn nội dung đầu vào cho AI.
        /// Giá trị hợp lệ: 'Text', 'PDF', 'File'
        /// </summary>
        [Required]
        public string InputSourceType { get; set; } = null!; // 'Text' | 'PDF' | 'File'

        /// <summary>
        /// Nội dung văn bản để AI xử lý.
        /// Dùng khi InputSourceType = 'Text': giáo viên gõ trực tiếp.
        /// Dùng khi InputSourceType = 'PDF'/'File': text đã được trích từ file.
        /// </summary>
        [Required]
        [MinLength(20, ErrorMessage = "Nội dung tối thiểu 20 ký tự để AI có thể xử lý")]
        [MaxLength(50000, ErrorMessage = "Nội dung tối đa 50.000 ký tự (~20 trang) để đảm bảo AI xử lý chính xác")]
        public string InputContent { get; set; } = null!;

        /// <summary>
        /// Tiêu đề bài học (context giúp AI sinh nội dung phù hợp).
        /// Nếu để trống thì hệ thống lấy từ tên lesson trong DB.
        /// </summary>
        public string? LessonTitle { get; set; }

        /// <summary>
        /// Có lưu luôn kết quả vào DB không?
        /// true = save ngay; false = chỉ trả về preview (giáo viên review trước).
        /// Mặc định: false (preview first).
        /// </summary>
        public bool SaveToDB { get; set; } = false;
    }
}
