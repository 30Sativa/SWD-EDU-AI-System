using EduAISystem.Application.Common.Models;

namespace EduAISystem.Application.Features.Courses.DTOs.Request
{
    public class CourseListRequestDto : PagedRequest
    {
        public string? SearchTerm { get; set; }

        public string? Status { get; set; }

        public Guid? SubjectId { get; set; }
        public bool? IsTemplate { get; set; }

        /// <summary>
        /// null: chỉ lấy khóa học chưa xóa (mặc định)
        /// true: chỉ lấy khóa học đã xóa (DeletedAt != null)
        /// false: chỉ lấy khóa học chưa xóa (DeletedAt == null)
        /// </summary>
        public bool? IsDeletedFilter { get; set; }
    }
}

