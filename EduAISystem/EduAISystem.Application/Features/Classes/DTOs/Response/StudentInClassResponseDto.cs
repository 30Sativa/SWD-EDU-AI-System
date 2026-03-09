using System;

namespace EduAISystem.Application.Features.Classes.DTOs.Response
{
    public class StudentInClassResponseDto
    {
        public Guid UserId { get; set; }
        public string? StudentCode { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime? JoinedAt { get; set; }
        public bool IsActive { get; set; }
    }
}
