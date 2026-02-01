using EduAISystem.Application.Features.Users.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Users.Validators
{
    public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
    {
        private static readonly string[] ValidGenders = { "Male", "Female", "Other" };

        public UpdateUserProfileCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty()
                .WithMessage("Id người dùng không được để trống.");

            RuleFor(x => x.Request.FullName)
                .NotEmpty()
                .WithMessage("Họ tên không được để trống.")
                .MaximumLength(200)
                .WithMessage("Họ tên không được vượt quá 200 ký tự.");

            RuleFor(x => x.Request.Gender)
                .Must(g => g == null || ValidGenders.Contains(g, StringComparer.OrdinalIgnoreCase))
                .WithMessage("Giới tính không hợp lệ (Male, Female, Other).")
                .When(x => !string.IsNullOrWhiteSpace(x.Request.Gender));
        }
    }
}
