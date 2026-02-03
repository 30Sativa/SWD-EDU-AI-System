using EduAISystem.Application.Features.CourseCategories.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.CourseCategories.Validators
{
    public class CreateCourseCategoryCommandValidator : AbstractValidator<CreateCourseCategoryCommand>
    {
        public CreateCourseCategoryCommandValidator()
        {
            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên danh mục khóa học không được để trống.")
                .MaximumLength(100).WithMessage("Tên danh mục khóa học không được vượt quá 100 ký tự.");

            RuleFor(x => x.Request.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("SortOrder không được âm.");
        }
    }
}

