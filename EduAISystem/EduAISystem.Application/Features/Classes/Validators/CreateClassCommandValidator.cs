using EduAISystem.Application.Features.Classes.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Classes.Validators
{
    public class CreateClassCommandValidator : AbstractValidator<CreateClassCommand>
    {
        public CreateClassCommandValidator()
        {
            RuleFor(x => x.Request.Code)
                .NotEmpty().WithMessage("Mã lớp không được để trống.")
                .MaximumLength(20).WithMessage("Mã lớp không được vượt quá 20 ký tự.");

            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên lớp không được để trống.")
                .MaximumLength(100).WithMessage("Tên lớp không được vượt quá 100 ký tự.");

            RuleFor(x => x.Request.Description)
                .MaximumLength(500).WithMessage("Mô tả lớp không được vượt quá 500 ký tự.")
                .When(x => x.Request.Description != null);

            RuleFor(x => x.Request.MaxStudents)
                .GreaterThan(0).WithMessage("Số học sinh tối đa phải lớn hơn 0.");
        }
    }
}

