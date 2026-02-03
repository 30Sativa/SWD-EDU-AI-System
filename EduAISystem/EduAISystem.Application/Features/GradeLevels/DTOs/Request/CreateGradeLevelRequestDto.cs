namespace EduAISystem.Application.Features.GradeLevels.DTOs.Request
{
    public class CreateGradeLevelRequestDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }
}

