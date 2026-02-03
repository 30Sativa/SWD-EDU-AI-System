using EduAISystem.Application.Features.Courses.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Courses.Validators
{
    public class PublishCourseCommandValidator : AbstractValidator<PublishCourseCommand>
    {
        public PublishCourseCommandValidator()
        {
            RuleFor(x => x.CourseId)
                .NotEqual(Guid.Empty).WithMessage("CourseId không hợp lệ.");

            RuleFor(x => x.TeacherId)
                .NotEqual(Guid.Empty).WithMessage("TeacherId không hợp lệ.");
        }
    }
}

