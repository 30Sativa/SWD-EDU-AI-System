using System;

namespace EduAISystem.Application.Features.AuditLogs.DTOs.Response
{
    public class AuditLogResponseDto
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string? Action { get; set; }
        public string? Entity { get; set; }
        public Guid? EntityId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
