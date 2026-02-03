using EduAISystem.Application.Common.Models;

namespace EduAISystem.Application.Features.GradeLevels.DTOs.Request
{
    public class GradeLevelListRequestDto : PagedRequest
    {
        public string? SearchTerm { get; set; }
        public bool? IsActiveFilter { get; set; }
    }
}

