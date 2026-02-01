using EduAISystem.Application.Features.Users.Queries;
using EduAISystem.Domain.Enums;
using FluentValidation;

namespace EduAISystem.Application.Features.Users.Validators
{
    public class ListUsersQueryValidator : AbstractValidator<ListUsersQuery>
    {
        private static readonly int[] ValidRoles =
        {
            (int)UserRoleDomain.User,
            (int)UserRoleDomain.Admin,
            (int)UserRoleDomain.Manager
        };

        public ListUsersQueryValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1)
                .WithMessage("Số trang phải từ 1 trở lên.");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100)
                .WithMessage("Số lượng phần tử mỗi trang phải từ 1 đến 100.");

            RuleFor(x => x.SearchTerm)
                .MaximumLength(100)
                .WithMessage("Từ khóa tìm kiếm không được vượt quá 100 ký tự.");

            RuleFor(x => x.RoleFilter)
                .Must(r => r == null || ValidRoles.Contains(r.Value))
                .WithMessage("Bộ lọc vai trò không hợp lệ.")
                .When(x => x.RoleFilter.HasValue);
        }
    }
}
