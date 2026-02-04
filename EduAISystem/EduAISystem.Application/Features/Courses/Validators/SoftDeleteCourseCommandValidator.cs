using EduAISystem.Application.Features.Courses.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Courses.Validators
{
    public class SoftDeleteCourseCommandValidator : AbstractValidator<SoftDeleteCourseCommand>
    {
        public SoftDeleteCourseCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Id khóa học không được để trống.");
        }
    }
}

