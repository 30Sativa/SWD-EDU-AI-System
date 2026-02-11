using EduAISystem.Application.Features.Users.Commands;
using EduAISystem.Domain.Enums;
using FluentValidation;

namespace EduAISystem.Application.Features.Users.Validators
{
    public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
    {
        private static readonly int[] AllowedRoles =
        {
            (int)UserRoleDomain.Admin,
            (int)UserRoleDomain.Manager,
            (int)UserRoleDomain.Student,
            (int)UserRoleDomain.Teacher
        };

        public CreateUserCommandValidator()
        {
            RuleFor(x => x.Request.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Email không hợp lệ.")
                .MaximumLength(256).WithMessage("Email không được vượt quá 256 ký tự.");

          
            RuleFor(x => x.Request.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống.")
                .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự.");

            RuleFor(x => x.Request.Role)
                .Must(r => AllowedRoles.Contains(r))
                .WithMessage("Vai trò phải là Admin, Manager, Student hoặc Teacher.");
        }
    }
}
