using EduAISystem.Application.Features.Auth.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Auth.Validators
{
    public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenCommandValidator()
        {
            RuleFor(v => v.Request.Token)
                .NotEmpty().WithMessage("Refresh token is required.");
        }
    }
}
