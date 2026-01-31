using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class LoginSessionRepository : ILoginSessionRepository
    {
        private readonly EduAiDbV5Context _context;

        public LoginSessionRepository(EduAiDbV5Context context)
        {
            _context = context;
        }
        public async Task AddAsync(LoginSessionDomain loginSession)
        {
            // map domain to ef
            var entity = new LoginSession
            {
                Id = loginSession.Id,
                UserId = loginSession.UserId,
                DeviceName = loginSession.DeviceName,
                IpAddress = loginSession.IpAddress,
                UserAgent = loginSession.UserAgent,
                CreatedAt = loginSession.CreatedAt,
                LastActivityAt = loginSession.LastActivityAt
            };
            _context.Add(entity);
            await _context.SaveChangesAsync();
        }
    }
}
