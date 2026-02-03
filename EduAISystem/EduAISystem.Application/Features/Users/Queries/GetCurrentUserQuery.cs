using EduAISystem.Application.Features.Users.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Users.Queries
{
    public record GetCurrentUserQuery(Guid UserId) : IRequest<UserDetailResponseDto>
    {
    }
}
