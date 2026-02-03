using EduAISystem.Application.Features.Subjects.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Subjects.Validators
{
    public class UpdateSubjectCommandValidator : AbstractValidator<UpdateSubjectCommand>
    {
        public UpdateSubjectCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Id môn học không được để trống.");

            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên môn học không được để trống.")
                .MaximumLength(100).WithMessage("Tên môn học không được vượt quá 100 ký tự.");

            RuleFor(x => x.Request.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("SortOrder không được âm.");
        }
    }
}

