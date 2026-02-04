using EduAISystem.Application.Common.Models;

namespace EduAISystem.Application.Features.Terms.DTOs.Request
{
    public class TermListRequestDto : PagedRequest
    {
        public string? SearchTerm { get; set; }
        public bool? IsActiveFilter { get; set; }
        public DateOnly? FromStartDate { get; set; }
        public DateOnly? ToEndDate { get; set; }
    }
}

