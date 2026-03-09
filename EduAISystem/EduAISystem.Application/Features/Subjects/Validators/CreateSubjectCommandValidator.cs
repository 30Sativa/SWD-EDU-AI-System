using EduAISystem.Application.Features.Subjects.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Subjects.Validators
{
    public class CreateSubjectCommandValidator : AbstractValidator<CreateSubjectCommand>
    {
        public CreateSubjectCommandValidator()
        {
            RuleFor(x => x.Request.Code)
                .NotEmpty().WithMessage("Mã môn học không được để trống.")
                .MaximumLength(20).WithMessage("Mã môn học không được vượt quá 20 ký tự.");

            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên môn học không được để trống.")
                .MaximumLength(100).WithMessage("Tên môn học không được vượt quá 100 ký tự.");

            RuleFor(x => x.Request.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("SortOrder không được âm.");
        }
    }
}

