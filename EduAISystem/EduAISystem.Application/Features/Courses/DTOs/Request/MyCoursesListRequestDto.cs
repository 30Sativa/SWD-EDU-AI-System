using EduAISystem.Application.Common.Models;

namespace EduAISystem.Application.Features.Courses.DTOs.Request
{
    public class MyCoursesListRequestDto : PagedRequest
    {
        public string? SearchTerm { get; set; }
        public string? Status { get; set; }
        public Guid? SubjectId { get; set; }
    }
}

