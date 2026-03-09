using MediatR;
using System;

namespace EduAISystem.Application.Features.Classes.Commands
{
    public class AssignSubjectTeacherCommand : IRequest<bool>
    {
        public Guid ClassId { get; set; }
        public Guid SubjectId { get; set; }
        public Guid TeacherId { get; set; }
    }
}
