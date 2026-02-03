using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class CreateCourseCommandHandler : IRequestHandler<CreateCourseCommand, CourseDetailResponseDto>
    {
        private readonly ICourseRepository _courseRepository;

        public CreateCourseCommandHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<CourseDetailResponseDto> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var course = CourseDomain.Create(
                dto.Code,
                dto.Title,
                dto.SubjectId,
                request.TeacherId,
                dto.Description,
                dto.Thumbnail,
                dto.GradeLevelId,
                dto.CategoryId,
                dto.Level,
                dto.Language,
                dto.Price,
                dto.DiscountPrice,
                dto.TotalLessons,
                dto.TotalDuration);

            await _courseRepository.AddAsync(course, cancellationToken);

            // Reload to ensure SubjectName and other info are filled
            var saved = await _courseRepository.GetByIdAsync(course.Id, cancellationToken) ?? course;

            return new CourseDetailResponseDto
            {
                Id = saved.Id,
                Code = saved.Code,
                Title = saved.Title,
                Slug = saved.Slug,
                Description = saved.Description,
                Thumbnail = saved.Thumbnail,
                SubjectId = saved.SubjectId,
                SubjectName = saved.SubjectName,
                GradeLevelId = saved.GradeLevelId,
                TeacherId = saved.TeacherId,
                CategoryId = saved.CategoryId,
                Level = saved.Level,
                Language = saved.Language,
                Price = saved.Price,
                DiscountPrice = saved.DiscountPrice,
                TotalLessons = saved.TotalLessons,
                TotalDuration = saved.TotalDuration,
                EnrollmentCount = saved.EnrollmentCount,
                Rating = saved.Rating,
                ReviewCount = saved.ReviewCount,
                Status = saved.Status.ToString(),
                IsActive = saved.IsActive,
                IsFeatured = saved.IsFeatured,
                CreatedAt = saved.CreatedAt,
                UpdatedAt = saved.UpdatedAt
            };
        }
    }
}

