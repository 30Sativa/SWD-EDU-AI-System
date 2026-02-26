using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class CreateTemplateCourseHandler
        : IRequestHandler<CreateTemplateCourseCommand, Guid>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ISubjectRepository _subjectRepository;

        public CreateTemplateCourseHandler(ICourseRepository courseRepository, ISubjectRepository subjectRepository)
        {
            _courseRepository = courseRepository;
            _subjectRepository = subjectRepository;
        }

        public async Task<Guid> Handle(
            CreateTemplateCourseCommand request,
            CancellationToken cancellationToken)
        {
            
            var dto = request.Request;
            if(await _subjectRepository.GetByIdAsync(dto.SubjectId, cancellationToken) is null)
            {
                throw new NotFoundException(
                    $"Subject with id {dto.SubjectId} does not exist.");
            }
            if (await _courseRepository.ExistsByCodeAsync(dto.Code, cancellationToken))
            {
                throw new ConflictException(
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