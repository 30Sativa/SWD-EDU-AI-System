using EduAISystem.Application.Features.GradeLevels.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.GradeLevels.Validators
{
    public class UpdateGradeLevelCommandValidator : AbstractValidator<UpdateGradeLevelCommand>
    {
        public UpdateGradeLevelCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEqual(Guid.Empty).WithMessage("Id không hợp lệ.");

            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên khối/lớp không được để trống.")
                .MaximumLength(100).WithMessage("Tên khối/lớp không được vượt quá 100 ký tự.");

            RuleFor(x => x.Request.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("SortOrder không được âm.");
        }
    }
}

