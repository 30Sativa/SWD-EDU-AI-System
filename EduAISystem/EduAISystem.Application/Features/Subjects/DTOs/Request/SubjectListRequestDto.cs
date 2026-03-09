using EduAISystem.Application.Common.Models;

namespace EduAISystem.Application.Features.Subjects.DTOs.Request
{
    public class SubjectListRequestDto : PagedRequest
    {
        public string? SearchTerm { get; set; }
        public bool? IsActiveFilter { get; set; }
    }
}

