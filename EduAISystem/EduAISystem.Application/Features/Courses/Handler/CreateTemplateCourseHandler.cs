using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class CreateTemplateCourseHandler
        : IRequestHandler<CreateTemplateCourseCommand, Guid>
    {
        private readonly ICourseRepository _courseRepository;

        public CreateTemplateCourseHandler(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<Guid> Handle(
            CreateTemplateCourseCommand request,
            CancellationToken cancellationToken)
        {
            //test
            var dto = request.Request;
            Console.WriteLine("==== DEBUG START ====");
            Console.WriteLine("SubjectId: " + dto.SubjectId);
            Console.WriteLine("Code: " + dto.Code);
            Console.WriteLine("==== DEBUG END ====");
            if (await _courseRepository.ExistsByCodeAsync(dto.Code, cancellationToken))
            {
                throw new InvalidOperationException(
                    $"Course with code {dto.Code} already exists.");
            }

            var course = CourseDomain.CreateTemplate(
                code: dto.Code,
                title: dto.Title,
                subjectId: dto.SubjectId,
                level: dto.Level,
                createdByUserId: dto.CreatedByUserId, // 🔥 Manager
                gradeLevelId: dto.GradeLevelId,
                categoryId: dto.CategoryId,
                description: dto.Description,
                thumbnail: dto.Thumbnail
            );

            await _courseRepository.AddAsync(course, cancellationToken);

            return course.Id;
        }
    }
}