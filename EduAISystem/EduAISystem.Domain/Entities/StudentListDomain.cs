using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    public class StudentListDomain
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }
        public string? StudentCode { get; set; }
        public UserRoleDomain Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public Guid? GradeLevelId { get; set; }
        public string? GradeLevelName { get; set; }

        public List<StudentClassInfo> Classes { get; set; } = new();
    }

    public class StudentClassInfo
    {
        public Guid ClassId { get; set; }
        public string? ClassName { get; set; }
        public Guid? TermId { get; set; }
        public string? TermName { get; set; }
    }
}
