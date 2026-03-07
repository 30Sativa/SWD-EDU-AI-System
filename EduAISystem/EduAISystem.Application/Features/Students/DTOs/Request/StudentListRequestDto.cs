using EduAISystem.Application.Common.Models;

namespace EduAISystem.Application.Features.Students.DTOs.Request
{
    public class StudentListRequestDto : PagedRequest
    {
        public string? SearchTerm { get; set; }
        public Guid? GradeLevelId { get; set; }
        public Guid? TermId { get; set; }
        public Guid? ClassId { get; set; }
        public bool? IsActiveFilter { get; set; }
    }
}
