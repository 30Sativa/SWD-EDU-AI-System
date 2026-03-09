using MediatR;
using System;

namespace EduAISystem.Application.Features.Classes.Commands
{
    public record EnrollStudentsByExcelCommand(Guid ClassId, string FileName, byte[] FileContent) : IRequest<(int count, List<string> errors)>;
}
