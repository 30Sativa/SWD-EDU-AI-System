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

            var course = CourseDomain.CreateTemplate(request.Request.Code,request.Request.Title,request.Request.SubjectId,request.Request.Level,request.Request.GradeLevelId,request.Request.CategoryId,request.Request.Description,request.Request.Thumbnail);

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
                GradeLevelId = saved.GradeLevelId,
                TeacherId = saved.TeacherId,
                CategoryId = saved.CategoryId,
                //Level = saved.Level,
                Language = saved.Language,
                TotalLessons = saved.TotalLessons,
                TotalDuration = saved.TotalDuration,
                Status = saved.Status.ToString(),
                IsActive = saved.IsActive,
                CreatedAt = saved.CreatedAt,
                UpdatedAt = saved.UpdatedAt
            };
        }
    }
}

