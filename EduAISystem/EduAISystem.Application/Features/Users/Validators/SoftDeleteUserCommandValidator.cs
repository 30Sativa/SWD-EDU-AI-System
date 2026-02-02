using EduAISystem.Application.Features.Users.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Users.Validators
{
    public class SoftDeleteUserCommandValidator : AbstractValidator<SoftDeleteUserCommand>
    {
        public SoftDeleteUserCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Id người dùng không được để trống.");
        }
    }
}
