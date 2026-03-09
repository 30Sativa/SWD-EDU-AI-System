namespace EduAISystem.Application.Features.Classes.DTOs.Response
{
    public class ClassDetailResponseDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public Guid? TeacherId { get; set; }
        public string? TeacherName { get; set; }

        public Guid? TermId { get; set; }
        public string? TermName { get; set; }

        public Guid? GradeLevelId { get; set; }
        public string? GradeLevelName { get; set; }

        public int MaxStudents { get; set; }
        public int CurrentStudents { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

