using EduAISystem.Application.Features.Courses.DTOs.Request;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public class CreateCourseCommand : IRequest<CourseDetailResponseDto>
    {
        public Guid TeacherId { get; set; }
        public CreateCourseRequestDto Request { get; set; } = null!;
    }
}

