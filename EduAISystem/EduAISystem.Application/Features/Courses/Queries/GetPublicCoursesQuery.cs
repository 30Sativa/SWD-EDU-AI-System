using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Queries
{
    /// <summary>
    /// Query công khai: học sinh/guest duyệt danh sách course đã publish, active.
    /// Hỗ trợ filter theo môn, khối, kỳ học, danh mục.
    /// </summary>
    public class GetPublicCoursesQuery : IRequest<PagedResult<CourseListItemResponseDto>>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }

        // Filter theo danh mục
        public Guid? CategoryId { get; set; }

        // Filter theo môn học
        public Guid? SubjectId { get; set; }

        // Filter theo khối lớp
        public Guid? GradeLevelId { get; set; }

        // Filter theo kỳ học (thông qua lớp được gán khóa học)
        public Guid? TermId { get; set; }
    }
}
