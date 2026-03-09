using MediatR;
using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Classes.Commands
{
    public record AddStudentsToClassCommand(Guid ClassId, List<Guid> StudentUserIds) : IRequest<bool>;
}
