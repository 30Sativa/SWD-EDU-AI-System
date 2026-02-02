using EduAISystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ILoginSessionRepository
    {
        Task AddAsync(LoginSessionDomain token);
    }
}
