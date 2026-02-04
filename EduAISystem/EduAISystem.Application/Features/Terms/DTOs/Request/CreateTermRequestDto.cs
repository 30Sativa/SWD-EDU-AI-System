namespace EduAISystem.Application.Features.Terms.DTOs.Request
{
    public class CreateTermRequestDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }
}

