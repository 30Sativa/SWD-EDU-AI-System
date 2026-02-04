using MediatR;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public class SoftDeleteCourseCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}

