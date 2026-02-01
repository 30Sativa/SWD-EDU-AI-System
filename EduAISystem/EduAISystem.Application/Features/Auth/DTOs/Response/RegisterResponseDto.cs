using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Auth.DTOs.Response
{
    public class RegisterResponseDto
    {
        public Guid UserId {  get; set; }
        public string Email {  get; set; }
    }
}
