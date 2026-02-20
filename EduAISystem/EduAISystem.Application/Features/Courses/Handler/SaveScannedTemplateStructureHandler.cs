using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class SaveScannedTemplateStructureHandler
    : IRequestHandler<SaveScannedTemplateStructureCommand, Unit>
    {
        private readonly ICourseRepository _courseRepository;

        public SaveScannedTemplateStructureHandler(
            ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<Unit> Handle(
            SaveScannedTemplateStructureCommand request,
            CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.CourseId);

            if (course == null || !course.IsTemplate)
                throw new Exception("Invalid template");

            foreach (var sectionDto in request.Sections)
            {
                var section = SectionDomain.Create(
                    course.Id,
                    sectionDto.Title,
                    null,
                    sectionDto.SortOrder);

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

                    section.Lessons.Add(lesson);
                }

                course.AddSection(section);
            }

            await _courseRepository.UpdateAsync(course);

            return Unit.Value;
        }
    }
}
