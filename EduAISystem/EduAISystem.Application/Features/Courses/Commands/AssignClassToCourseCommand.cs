using MediatR;
using System;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public class AssignClassToCourseCommand : IRequest<bool>
    {
        public Guid CourseId { get; set; }
        public Guid ClassId { get; set; }
        public Guid TeacherId { get; set; }
    }
}
