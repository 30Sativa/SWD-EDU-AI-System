using System.ComponentModel.DataAnnotations;

namespace EduAISystem.Application.Features.Lessons.DTOs.Request
{
    /// <summary>
    /// DTO để giáo viên lưu (hoặc chỉnh sửa rồi lưu) các blocks từ AI preview.
    /// 
    /// Flow: generate-ai (preview) → teacher review/edit → save-preview
    /// 
    /// Giáo viên có thể:
    /// - Giữ nguyên blocks từ preview (không thay đổi gì)
    /// - Chỉnh sửa nội dung, blockType, sortOrder trước khi lưu
    /// - Bỏ bớt blocks không muốn (chỉ gửi những blocks muốn lưu)
    /// </summary>
    public class SaveAiPreviewRequestDto
    {
        /// <summary>
        /// Danh sách blocks muốn lưu.
        /// Teacher có thể chỉnh sửa content, blockType, sortOrder trước khi gửi.
        /// Chỉ những blocks trong danh sách này sẽ được lưu vào DB.
        /// </summary>
        [Required(ErrorMessage = "Phải có ít nhất 1 block để lưu")]
        [MinLength(1, ErrorMessage = "Danh sách blocks không được rỗng")]
        public List<EditableBlockDto> Blocks { get; set; } = new();

        /// <summary>
        /// Nguồn đầu vào AI đã dùng (Text/PDF/File).
        /// Nếu để trống, hệ thống lấy từ cache preview.
        /// </summary>
        public string? InputSourceType { get; set; }
    }

    /// <summary>
    /// Một block có thể chỉnh sửa trước khi lưu.
    /// </summary>
    public class EditableBlockDto
    {
        /// <summary>
        /// Loại block: 'Concept', 'Example', 'Exercise', 'Reflection'
        /// </summary>
        [Required]
        public string BlockType { get; set; } = null!;

        /// <summary>
        /// Nội dung block (có thể đã được teacher chỉnh sửa từ preview)
        /// </summary>
        [Required]
        [MinLength(1, ErrorMessage = "Nội dung block không được rỗng")]
        public string Content { get; set; } = null!;

        /// <summary>
        /// Thứ tự hiển thị
        /// </summary>
        public int SortOrder { get; set; }

        /// <summary>
        /// Thời gian đọc/học ước tính (phút)
        /// </summary>
        public int? EstimatedMinutes { get; set; }
    }
}
