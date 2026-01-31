using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Domain.Entities
{
    public class LoginSessionDomain
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }

        public string DeviceName { get; private set; } = string.Empty;
        public string IpAddress { get; private set; } = string.Empty;
        public string UserAgent { get; private set; } = string.Empty;

        public DateTime CreatedAt { get; private set; }
        public DateTime LastActivityAt { get; private set; }

        protected LoginSessionDomain() { } // EF


        //Business constructor (use khi login)
        public LoginSessionDomain(
            Guid userId,
            string deviceName,
            string ipAddress,
            string userAgent)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            DeviceName = deviceName;
            IpAddress = ipAddress;
            UserAgent = userAgent;
            CreatedAt = DateTime.UtcNow;
            LastActivityAt = CreatedAt;
        }


        //Mapping constructor (Infrastructure only)
        internal LoginSessionDomain(
            Guid id,
            Guid userId,
            string deviceName,
            string ipAddress,
            string userAgent,
            DateTime createdAt,
            DateTime lastActivityAt)
        {
            Id = id;
            UserId = userId;
            DeviceName = deviceName;
            IpAddress = ipAddress;
            UserAgent = userAgent;
            CreatedAt = createdAt;
            LastActivityAt = lastActivityAt;
        }


        public void Touch()
        {
            LastActivityAt = DateTime.UtcNow;
        }
    }
}
