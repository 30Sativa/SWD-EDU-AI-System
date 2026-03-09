namespace EduAISystem.Application.Features.Subjects.DTOs.Response
{
    public class SubjectDetailResponseDto
    {
        public Guid Id { get; init; }
        public string Code { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string? NameEn { get; init; }
        public string? Description { get; init; }
        public string? IconUrl { get; init; }
        public string? Color { get; init; }
        public int SortOrder { get; init; }
        public bool IsActive { get; init; }
    }
}

