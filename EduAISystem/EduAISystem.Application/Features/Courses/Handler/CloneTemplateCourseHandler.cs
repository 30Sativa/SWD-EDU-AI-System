using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class CloneTemplateCourseHandler
        : IRequestHandler<CloneTemplateCourseCommand, Guid>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ISectionRepository _sectionRepository;
        private readonly ILessonRepository _lessonRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserService _currentUser;

        public CloneTemplateCourseHandler(
            ICourseRepository courseRepository,
            ISectionRepository sectionRepository,
            ILessonRepository lessonRepository,
            IUserRepository userRepository,
            ICurrentUserService currentUser)
        {
            _courseRepository = courseRepository;
            _sectionRepository = sectionRepository;
            _lessonRepository = lessonRepository;
            _userRepository = userRepository;
            _currentUser = currentUser;
        }

        public async Task<Guid> Handle(
            CloneTemplateCourseCommand request,
            CancellationToken cancellationToken)
        {
            var dto = request.Request;

            // Validate authentication
            var createdByUserId = _currentUser.UserId;
            if (createdByUserId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("User must be authenticated to clone a template course.");
            }

            var template = await _courseRepository
                .GetTemplateWithDetailsAsync(dto.TemplateId, cancellationToken);

            if (template == null)
                throw new NotFoundException($"Template course with id {dto.TemplateId} does not exist.");

            if (!template.IsTemplate)
                throw new ConflictException($"Course with id {dto.TemplateId} is not a template course.");

            // Validate TeacherId exists
            if (await _userRepository.GetByIdAsync(dto.TeacherId, cancellationToken) is null)
            {
                throw new NotFoundException($"User (Teacher) with id {dto.TeacherId} does not exist.");
            }

            // Validate Course Code uniqueness
            if (await _courseRepository.ExistsByCodeAsync(dto.NewCode, cancellationToken))
            {
                throw new ConflictException($"Course with code {dto.NewCode} already exists.");
            }

            var cloneCourse = CourseDomain.CloneFromTemplate(
                template,
                dto.TeacherId,
                createdByUserId,
                dto.NewCode
            );

            // Save course first
            await _courseRepository.AddAsync(cloneCourse, cancellationToken);

            // =========================
            // CLONE SECTIONS & LESSONS
            // =========================
            foreach (var section in template.Sections)
            {
                // Create section
                var newSection = SectionDomain.Create(
                    cloneCourse.Id,
                    section.Title,
                    section.Description,
                    section.SortOrder
                );

                // Save section to database first
                await _sectionRepository.AddAsync(newSection, cancellationToken);

                // Create and save lessons for this section
                var lessons = new List<LessonDomain>();
                foreach (var lesson in section.Lessons)
                {
                    var newLesson = LessonDomain.Create(
                        newSection.Id,
                        lesson.Title,
                        lesson.Slug,
                        lesson.VideoUrl,
                        lesson.Content,
                        lesson.SortOrder,
                        lesson.Duration,
                        lesson.IsPreview
                    );

                    lessons.Add(newLesson);
                }

                // Save all lessons for this section
                if (lessons.Any())
                {
                    await _lessonRepository.AddRangeAsync(lessons, cancellationToken);
                }
            }

            return cloneCourse.Id;
        }
    }
}