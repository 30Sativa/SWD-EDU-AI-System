using System;

namespace EduAISystem.Domain.Entities
{
    public class AuditLogDomain
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? Action { get; set; } = null!;
        public string? Entity { get; set; } = null!;
        public Guid? EntityId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime? CreatedAt { get; set; }
        
        // Tránh reference sang UserDomain ở đây để giảm phức tạp nếu không cần thiết ngay
        public string? UserEmail { get; set; }
    }
}
