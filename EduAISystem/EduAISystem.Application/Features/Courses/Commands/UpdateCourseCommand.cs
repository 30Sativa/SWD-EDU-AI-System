using EduAISystem.Application.Features.Courses.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public class UpdateCourseCommand : IRequest<Unit>
    {
        public Guid CourseId { get; set; }
        public Guid TeacherId { get; set; }
        public UpdateCourseRequestDto Request { get; set; } = null!;

        public UpdateCourseCommand(Guid courseId, Guid teacherId, UpdateCourseRequestDto request)
        {
            CourseId = courseId;
            TeacherId = teacherId;
            Request = request;
        }
    }
}
