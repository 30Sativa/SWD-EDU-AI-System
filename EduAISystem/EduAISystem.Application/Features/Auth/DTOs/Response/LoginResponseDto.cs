using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Auth.DTOs.Response
{
    public class LoginResponseDto
    {
        public Guid SessionId { get; set; }
        public string AccessToken { get; set; } = "";
        public DateTime ExpiredAt { get; set; }
    }
}
