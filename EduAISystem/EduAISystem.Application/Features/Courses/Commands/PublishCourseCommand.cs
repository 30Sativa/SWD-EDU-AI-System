using MediatR;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public class PublishCourseCommand : IRequest<bool>
    {
        public Guid TeacherId { get; set; }
        public Guid CourseId { get; set; }
    }
}

