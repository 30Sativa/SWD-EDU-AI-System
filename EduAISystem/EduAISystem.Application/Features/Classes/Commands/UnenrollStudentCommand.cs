using MediatR;
using System;

namespace EduAISystem.Application.Features.Classes.Commands
{
    public record UnenrollStudentCommand(Guid ClassId, Guid StudentUserId) : IRequest<bool>;
}
