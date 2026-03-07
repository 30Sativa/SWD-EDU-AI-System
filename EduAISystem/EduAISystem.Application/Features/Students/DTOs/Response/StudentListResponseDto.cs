using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Features.Students.DTOs.Response
{
    public class StudentListResponseDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }
        public string? StudentCode { get; set; }
        public int Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public Guid? GradeLevelId { get; set; }
        public string? GradeLevelName { get; set; }

        public List<StudentClassDto> Classes { get; set; } = new();
    }

    public class StudentClassDto
    {
        public Guid ClassId { get; set; }
        public string? ClassName { get; set; }
        public Guid? TermId { get; set; }
        public string? TermName { get; set; }
    }
}
