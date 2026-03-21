using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class UpdateTemplateCourseHandler : IRequestHandler<UpdateTemplateCourseCommand, Unit>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ISubjectRepository _subjectRepository;
        private readonly ICourseCategoryRepository _courseCategoryRepository;

        public UpdateTemplateCourseHandler(
            ICourseRepository courseRepository,
            ISubjectRepository subjectRepository,
            ICourseCategoryRepository courseCategoryRepository)
        {
            _courseRepository = courseRepository;
            _subjectRepository = subjectRepository;
            _courseCategoryRepository = courseCategoryRepository;
        }

        public async Task<Unit> Handle(UpdateTemplateCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.CourseId, cancellationToken);

            if (course == null)
            {
                throw new NotFoundException($"Course with id {request.CourseId} does not exist.");
            }

            if (!course.IsTemplate)
            {
                throw new ConflictException("This course is not a template and cannot be updated via this endpoint.");
            }

            var dto = request.Request;

            // Validate SubjectId exists
            if (await _subjectRepository.GetByIdAsync(dto.SubjectId, cancellationToken) is null)
            {
                throw new NotFoundException($"Subject with id {dto.SubjectId} does not exist.");
            }

            // Validate CategoryId exists
            if (await _courseCategoryRepository.GetByIdAsync(dto.CategoryId, cancellationToken) is null)
            {
                throw new NotFoundException($"Course category with id {dto.CategoryId} does not exist.");
            }

            // Validate Code uniqueness if changed
            if (course.Code != dto.Code && await _courseRepository.ExistsByCodeAsync(dto.Code, cancellationToken))
            {
                throw new ConflictException($"Course with code {dto.Code} already exists.");
            }

            // Update course info
            course.UpdateTemplateInfo(
                code: dto.Code,
                title: dto.Title,
                subjectId: dto.SubjectId,
                gradeLevelId: dto.GradeLevelId,
                categoryId: dto.CategoryId,
                description: dto.Description,
                thumbnail: dto.Thumbnail,
                level: dto.Level
            );

            await _courseRepository.UpdateAsync(course, cancellationToken);

            return Unit.Value;
        }
    }
}
