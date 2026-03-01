using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class SaveScannedTemplateStructureHandler
    : IRequestHandler<SaveScannedTemplateStructureCommand, Unit>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ISectionRepository _sectionRepository;
        private readonly ILessonRepository _lessonRepository;

        public SaveScannedTemplateStructureHandler(
            ICourseRepository courseRepository,
            ISectionRepository sectionRepository,
            ILessonRepository lessonRepository)
        {
            _courseRepository = courseRepository;
            _sectionRepository = sectionRepository;
            _lessonRepository = lessonRepository;
        }

        public async Task<Unit> Handle(
            SaveScannedTemplateStructureCommand request,
            CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.CourseId, cancellationToken);

            if (course == null)
                throw new NotFoundException($"Course with id {request.CourseId} does not exist.");

            if (!course.IsTemplate)
                throw new ConflictException($"Course with id {request.CourseId} is not a template course.");

            // Save sections first, then lessons (lessons need section.Id)
            foreach (var sectionDto in request.Sections)
            {
                // Create section
                var section = SectionDomain.Create(
                    course.Id,
                    sectionDto.Title,
                    null,
                    sectionDto.SortOrder);

                // Save section to database first
                await _sectionRepository.AddAsync(section, cancellationToken);

                // Create and save lessons for this section
                var lessons = new List<LessonDomain>();
                foreach (var lessonDto in sectionDto.Lessons)
                {
                    var lesson = LessonDomain.Create(
                        section.Id,
                        lessonDto.Title,
                        lessonDto.Title.ToLower().Replace(" ", "-"),
                        null,
                        null,
                        lessonDto.SortOrder,
                        null,
                        false);

                    lessons.Add(lesson);
                }

                // Save all lessons for this section
                if (lessons.Any())
                {
                    await _lessonRepository.AddRangeAsync(lessons, cancellationToken);
                }
            }

            return Unit.Value;
        }
    }
}
