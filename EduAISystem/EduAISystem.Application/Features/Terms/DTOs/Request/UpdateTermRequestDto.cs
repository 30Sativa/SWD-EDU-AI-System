namespace EduAISystem.Application.Features.Terms.DTOs.Request
{
    public class UpdateTermRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }
}

