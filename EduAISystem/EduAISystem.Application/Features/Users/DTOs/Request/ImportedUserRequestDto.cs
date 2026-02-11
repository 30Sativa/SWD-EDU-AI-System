using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Users.DTOs.Request
{
    public class ImportedUserRequestDto
    {
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
    }
}
