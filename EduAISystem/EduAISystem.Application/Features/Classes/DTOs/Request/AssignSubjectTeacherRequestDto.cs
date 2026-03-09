using System;

namespace EduAISystem.Application.Features.Classes.DTOs.Request
{
    public class AssignSubjectTeacherRequestDto
    {
        public Guid SubjectId { get; set; }
        public Guid TeacherId { get; set; }
    }
}
