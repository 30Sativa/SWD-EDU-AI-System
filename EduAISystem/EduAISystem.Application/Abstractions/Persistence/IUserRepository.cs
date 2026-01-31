using EduAISystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IUserRepository
    {
        Task<UserDomain?> GetByEmailAsync(string email);
    }
}
