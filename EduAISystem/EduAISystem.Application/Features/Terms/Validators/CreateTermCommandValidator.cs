using EduAISystem.Application.Features.Terms.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Terms.Validators
{
    public class CreateTermCommandValidator : AbstractValidator<CreateTermCommand>
    {
        public CreateTermCommandValidator()
        {
            RuleFor(x => x.Request.Code)
                .NotEmpty().WithMessage("Mã kỳ học không được để trống.")
                .MaximumLength(20).WithMessage("Mã kỳ học không được vượt quá 20 ký tự.");

            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên kỳ học không được để trống.")
                .MaximumLength(100).WithMessage("Tên kỳ học không được vượt quá 100 ký tự.");

            RuleFor(x => x.Request.EndDate)
                .Must((cmd, endDate) => endDate > cmd.Request.StartDate)
                .WithMessage("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
        }
    }
}

