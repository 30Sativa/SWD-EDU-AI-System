namespace EduAISystem.Application.Features.Subjects.DTOs.Request
{
    public class UpdateSubjectRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public string? Color { get; set; }
        public int SortOrder { get; set; } = 0;
    }
}

