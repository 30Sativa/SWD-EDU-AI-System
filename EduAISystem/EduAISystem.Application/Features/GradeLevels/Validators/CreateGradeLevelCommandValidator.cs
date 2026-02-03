using EduAISystem.Application.Features.GradeLevels.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.GradeLevels.Validators
{
    public class CreateGradeLevelCommandValidator : AbstractValidator<CreateGradeLevelCommand>
    {
        public CreateGradeLevelCommandValidator()
        {
            RuleFor(x => x.Request.Code)
                .NotEmpty().WithMessage("Mã khối/lớp không được để trống.")
                .MaximumLength(20).WithMessage("Mã khối/lớp không được vượt quá 20 ký tự.");

            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên khối/lớp không được để trống.")
                .MaximumLength(100).WithMessage("Tên khối/lớp không được vượt quá 100 ký tự.");

            RuleFor(x => x.Request.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("SortOrder không được âm.");
        }
    }
}

