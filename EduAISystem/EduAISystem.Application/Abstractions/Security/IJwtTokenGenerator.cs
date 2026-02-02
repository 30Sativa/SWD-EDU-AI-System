using EduAISystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Security
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(UserDomain userDomain, Guid sessionId);
        DateTime GetExpiredAt();
    }
}
