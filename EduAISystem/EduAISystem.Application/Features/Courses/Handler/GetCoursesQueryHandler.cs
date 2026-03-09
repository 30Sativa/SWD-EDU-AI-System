using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class GetCoursesQueryHandler : IRequestHandler<GetCoursesQuery, PagedResult<CourseListItemResponseDto>>
    {
        private readonly ICourseRepository _courseRepository;

        public GetCoursesQueryHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<PagedResult<CourseListItemResponseDto>> Handle(GetCoursesQuery request, CancellationToken cancellationToken)
        {
            var result = await _courseRepository.GetCoursesPagedAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.Status,
                request.SubjectId,
                request.IsDeletedFilter,
                request.IsTemplate,
                request.IsActive,
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

