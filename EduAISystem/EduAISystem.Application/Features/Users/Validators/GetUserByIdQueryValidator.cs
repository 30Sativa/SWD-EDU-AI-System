using EduAISystem.Application.Features.Users.Queries;
using FluentValidation;

namespace EduAISystem.Application.Features.Users.Validators
{
    public class GetUserByIdQueryValidator : AbstractValidator<GetUserByIdQuery>
    {
        public GetUserByIdQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Id người dùng không được để trống.");
        }
    }
}
