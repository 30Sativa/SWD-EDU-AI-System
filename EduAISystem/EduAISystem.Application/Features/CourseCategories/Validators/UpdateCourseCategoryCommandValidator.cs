using EduAISystem.Application.Features.CourseCategories.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.CourseCategories.Validators
{
    public class UpdateCourseCategoryCommandValidator : AbstractValidator<UpdateCourseCategoryCommand>
    {
        public UpdateCourseCategoryCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEqual(Guid.Empty).WithMessage("Id không hợp lệ.");

            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên danh mục khóa học không được để trống.")
                .MaximumLength(100).WithMessage("Tên danh mục khóa học không được vượt quá 100 ký tự.");

            RuleFor(x => x.Request.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("SortOrder không được âm.");
        }
    }
}

