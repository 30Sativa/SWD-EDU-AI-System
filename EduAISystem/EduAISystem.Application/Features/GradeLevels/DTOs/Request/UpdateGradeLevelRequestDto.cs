namespace EduAISystem.Application.Features.GradeLevels.DTOs.Request
{
    public class UpdateGradeLevelRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }
}

