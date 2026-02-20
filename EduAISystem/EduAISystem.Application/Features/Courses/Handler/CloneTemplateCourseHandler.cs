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
    public class CloneTemplateCourseHandler : IRequestHandler<CloneTemplateCourseCommand, Guid>
    {
        private readonly ICourseRepository _courseRepository;
        public CloneTemplateCourseHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }


        public async Task<Guid> Handle(CloneTemplateCourseCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;
            var template = await _courseRepository.GetTemplateWithDetailsAsync(dto.TemplateId, cancellationToken);

            if (template == null)
                throw new InvalidOperationException("Template course not found.");

            if (!template.IsTemplate)
                throw new InvalidOperationException("Source must be a template.");
           
            var cloneCourse = CourseDomain.CloneFromTemplate(template,dto.TeacherId, dto.NewCode);

            foreach(var section in template.Sections)
            {
                var newSection = SectionDomain.Create(cloneCourse.Id, section.Title, section.Description, section.SortOrder);
                foreach(var lesson in section.Lessons)
                {
                    var newLesson = LessonDomain.Create(newSection.Id, lesson.Title, lesson.Slug, lesson.VideoUrl, lesson.Content, lesson.SortOrder, lesson.Duration, lesson.IsPreview); 
                    newSection.Lessons.Add(newLesson);
                }
                cloneCourse.AddSection(newSection);
            }

           await _courseRepository.AddAsync(cloneCourse);
            return cloneCourse.Id;
        }
    }
}
