namespace EduAISystem.Application.Features.GradeLevels.DTOs.Response
{
    public class GradeLevelDetailResponseDto
    {
        public Guid Id { get; init; }
        public string Code { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public int SortOrder { get; init; }
        public bool IsActive { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}

