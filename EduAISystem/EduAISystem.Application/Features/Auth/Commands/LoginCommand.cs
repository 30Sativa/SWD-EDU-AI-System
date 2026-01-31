using EduAISystem.Application.Features.Auth.DTOs.Request;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Auth.Commands
{
    public record LoginCommand(LoginRequestDto Request) : IRequest<LoginResponseDto>
    {

    }
}
