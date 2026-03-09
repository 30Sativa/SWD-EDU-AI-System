using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class GetMyCoursesQueryHandler : IRequestHandler<GetMyCoursesQuery, PagedResult<CourseListItemResponseDto>>
    {
        private readonly ICourseRepository _courseRepository;

        public GetMyCoursesQueryHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<PagedResult<CourseListItemResponseDto>> Handle(GetMyCoursesQuery request, CancellationToken cancellationToken)
        {
            var result = await _courseRepository.GetTeacherCoursesPagedAsync(
                request.TeacherId,
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.Status,
                cancellationToken);

            var items = result.Items.Select(c => new CourseListItemResponseDto
            {
                Id = c.Id,
                Code = c.Code,
                Title = c.Title,
                Thumbnail = c.Thumbnail,
                SubjectId = c.SubjectId,
                Status = c.Status.ToString(),
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            }).ToList();

            return new PagedResult<CourseListItemResponseDto>
            {
                Items = items,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }
    }
}

