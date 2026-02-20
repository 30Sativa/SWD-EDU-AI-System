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
    public class CreateTemplateCourseHandler : IRequestHandler<CreateTemplateCourseCommand, Guid>
    {
        private readonly ICourseRepository _courseRepository;
        public CreateTemplateCourseHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }
        public async Task<Guid> Handle(CreateTemplateCourseCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;
            if(await _courseRepository.ExistsByCodeAsync(dto.Code,cancellationToken)){
                throw new InvalidOperationException($"Course with code {dto.Code} already exists.");
            }
            var course = CourseDomain.CreateTemplate(
                request.Request.Code, request.Request.Title, request.Request.SubjectId, request.Request.Level, request.Request.GradeLevelId, request.Request.CategoryId, request.Request.Description, request.Request.Thumbnail);

            await _courseRepository.AddAsync(course, cancellationToken);
            return course.Id;
        }
    }
}
