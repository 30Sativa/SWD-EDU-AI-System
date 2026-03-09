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
        private readonly ICourseCategoryRepository _courseCategoryRepository;
        private readonly IUserRepository _userRepository;
        
        public CreateTemplateCourseHandler(
            ICourseRepository courseRepository, 
            ISubjectRepository subjectRepository, 
            ICourseCategoryRepository courseCategoryRepository,
            IUserRepository userRepository)
        {
            _courseRepository = courseRepository;
            _subjectRepository = subjectRepository;
            _courseCategoryRepository = courseCategoryRepository;
            _userRepository = userRepository;
        }

        public async Task<Guid> Handle(
            CreateTemplateCourseCommand request,
            CancellationToken cancellationToken)
        {
            
            var dto = request.Request;
            
            // Validate SubjectId exists
            if(await _subjectRepository.GetByIdAsync(dto.SubjectId, cancellationToken) is null)
            {
                throw new NotFoundException(
                    $"Subject with id {dto.SubjectId} does not exist.");
            }
            
            // Validate Course Code uniqueness
            if (await _courseRepository.ExistsByCodeAsync(dto.Code, cancellationToken))
            {
                throw new ConflictException(
                    $"Course with code {dto.Code} already exists.");
            }
            
            // Validate CategoryId exists
            if(await _courseCategoryRepository.GetByIdAsync(dto.CategoryId, cancellationToken) is null)
            {
                throw new NotFoundException(
                    $"Course category with id {dto.CategoryId} does not exist.");
            }
            
            // Validate CreatedByUserId exists
            if(await _userRepository.GetByIdAsync(dto.CreatedByUserId, cancellationToken) is null)
            {
                throw new NotFoundException(
                    $"User with id {dto.CreatedByUserId} does not exist.");
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