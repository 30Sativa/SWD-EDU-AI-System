using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class GetCourseByIdQueryHandler : IRequestHandler<GetCourseByIdQuery, CourseDetailResponseDto?>
    {
        private readonly ICourseRepository _courseRepository;

        public GetCourseByIdQueryHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<CourseDetailResponseDto?> Handle(GetCourseByIdQuery request, CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.Id, cancellationToken);
            if (course == null)
            {
                return null;
            }

            return new CourseDetailResponseDto
            {
                Id = course.Id,
                Code = course.Code,
                Title = course.Title,
                Slug = course.Slug,
                Description = course.Description,
                Thumbnail = course.Thumbnail,
                SubjectId = course.SubjectId,
                GradeLevelId = course.GradeLevelId,
                TeacherId = course.TeacherId,
                CategoryId = course.CategoryId,
                Level = course.Level,
                Language = course.Language,
                TotalLessons = course.TotalLessons,
                TotalDuration = course.TotalDuration,
                Status = course.Status.ToString(),
                IsActive = course.IsActive,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt
            };
        }
    }
}

