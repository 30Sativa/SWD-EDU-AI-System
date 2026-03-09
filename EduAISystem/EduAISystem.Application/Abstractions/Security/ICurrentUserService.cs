using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Security
{
    public interface ICurrentUserService
    {
        Guid UserId { get; }
        string? Email { get; }
        string? Role { get; }
    }
}
