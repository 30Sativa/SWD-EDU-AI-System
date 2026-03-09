using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class CreateCourseCommandHandler
        : IRequestHandler<CreateCourseCommand, CourseDetailResponseDto>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ICurrentUserService _currentUser;

        public CreateCourseCommandHandler(
            ICourseRepository courseRepository,
            ICurrentUserService currentUser)
        {
            _courseRepository = courseRepository;
            _currentUser = currentUser;
        }

        public async Task<CourseDetailResponseDto> Handle(
            CreateCourseCommand request,
            CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var createdByUserId = _currentUser.UserId;
            if(createdByUserId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("User must be authenticated to create a course.");
            }

            var course = CourseDomain.CreateTemplate(
                code: dto.Code,
                title: dto.Title,
                subjectId: dto.SubjectId,
                level: dto.Level,
                createdByUserId: createdByUserId,
                gradeLevelId: dto.GradeLevelId,
                categoryId: dto.CategoryId,
                description: dto.Description,
                thumbnail: dto.Thumbnail
            );

            await _courseRepository.AddAsync(course, cancellationToken);

            var saved = await _courseRepository
                .GetByIdAsync(course.Id, cancellationToken) ?? course;

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