using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Enrollments.Commands
{
    public record EnrollCourseCommand(Guid CourseId) : IRequest<Guid>
    {
    }
}
