namespace EduAISystem.Application.Features.Classes.DTOs.Request
{
    public class UpdateClassRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid? TermId { get; set; }
        public Guid? GradeLevelId { get; set; }
        public int MaxStudents { get; set; } = 50;
    }
}

