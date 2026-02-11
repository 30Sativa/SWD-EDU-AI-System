using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Common
{
    public interface IEmailService
    {
        Task SendWelcomeEmail(string email, string password);
    }
}
