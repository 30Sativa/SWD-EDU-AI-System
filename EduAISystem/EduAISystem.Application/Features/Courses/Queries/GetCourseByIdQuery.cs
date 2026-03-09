using EduAISystem.Application.Features.Courses.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Queries
{
    public class GetCourseByIdQuery : IRequest<CourseDetailResponseDto?>
    {
        public Guid Id { get; set; }
    }
}

