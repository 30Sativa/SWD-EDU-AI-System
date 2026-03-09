using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Users.Commands
{
    public record ImportUsersCommand(string FileName, byte[] FileContent) : IRequest
    {
    }
}
