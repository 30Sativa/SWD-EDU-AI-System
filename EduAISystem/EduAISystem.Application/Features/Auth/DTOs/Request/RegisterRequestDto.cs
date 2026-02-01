using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Auth.DTOs.Request
{
    public class RegisterRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        public string UserName { get; set; } = string.Empty;

    }
}
