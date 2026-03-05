using System;

namespace EduAISystem.Application.Features.Classes.DTOs.Response
{
    /// <summary>
    /// Giáo viên bộ môn trong một lớp học
    /// </summary>
    public class ClassSubjectTeacherResponseDto
    {
        public Guid TeacherId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }
    }

    /// <summary>
    /// Lớp học mà giáo viên được phân công dạy bộ môn
    /// </summary>
    public class TeacherClassSubjectResponseDto
    {
        public Guid ClassId { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }
    }
}
