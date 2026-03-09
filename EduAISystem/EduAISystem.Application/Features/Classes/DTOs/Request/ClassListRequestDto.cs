using EduAISystem.Application.Common.Models;

namespace EduAISystem.Application.Features.Classes.DTOs.Request
{
    public class ClassListRequestDto : PagedRequest
    {
        public string? SearchTerm { get; set; }
        public bool? IsActiveFilter { get; set; }
        public Guid? TermId { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid? GradeLevelId { get; set; }
    }
}

