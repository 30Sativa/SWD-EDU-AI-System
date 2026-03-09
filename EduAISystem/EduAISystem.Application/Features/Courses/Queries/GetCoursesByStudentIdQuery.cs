using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Queries
{
    public class GetCoursesByStudentIdQuery : IRequest<PagedResult<CourseListItemResponseDto>>
    {
        public Guid StudentId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string? Status { get; set; }
    }
}
