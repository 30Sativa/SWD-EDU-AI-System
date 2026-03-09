using System;

namespace EduAISystem.Domain.Entities
{
    public class LoginAttemptDomain
    {
        public Guid Id { get; private set; }
        public string? Email { get; private set; }
        public Guid? UserId { get; private set; }
        public string? IpAddress { get; private set; }
        public bool IsSuccess { get; private set; }
        public string? FailureReason { get; private set; }
        public DateTime AttemptAt { get; private set; }

        protected LoginAttemptDomain() { }

        // Business constructor
        public LoginAttemptDomain(
            string? email,
            Guid? userId,
            string? ipAddress,
            bool isSuccess,
            string? failureReason)
        {
            Id = Guid.NewGuid();
            Email = email;
            UserId = userId;
            IpAddress = ipAddress;
            IsSuccess = isSuccess;
            FailureReason = failureReason;
            AttemptAt = DateTime.UtcNow;
        }

        // Mapping constructor
        internal LoginAttemptDomain(
            Guid id,
            string? email,
            Guid? userId,
            string? ipAddress,
            bool isSuccess,
            string? failureReason,
            DateTime attemptAt)
        {
            Id = id;
            Email = email;
            UserId = userId;
            IpAddress = ipAddress;
            IsSuccess = isSuccess;
            FailureReason = failureReason;
            AttemptAt = attemptAt;
        }
    }
}
