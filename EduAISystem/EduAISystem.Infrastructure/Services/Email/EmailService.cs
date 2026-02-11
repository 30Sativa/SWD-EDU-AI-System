using EduAISystem.Application.Abstractions.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Services.Email
{
    public class EmailService : IEmailService
    {
        public async Task SendWelcomeEmail(string email, string password)
        {
            // Tạm thời test bằng Console
            Console.WriteLine($"Send mail to {email}");
            Console.WriteLine($"Password: {password}");

            await Task.CompletedTask;
        }
    }
}
