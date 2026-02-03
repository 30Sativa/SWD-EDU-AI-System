using EduAISystem.Application.Features.Courses.Commands;
using FluentValidation;

namespace EduAISystem.Application.Features.Courses.Validators
{
    public class CreateCourseCommandValidator : AbstractValidator<CreateCourseCommand>
    {
        public CreateCourseCommandValidator()
        {
            RuleFor(x => x.Request.Code)
                .NotEmpty().WithMessage("Mã khóa học không được để trống.")
                .MaximumLength(20).WithMessage("Mã khóa học không được vượt quá 20 ký tự.");

            RuleFor(x => x.Request.Title)
                .NotEmpty().WithMessage("Tiêu đề khóa học không được để trống.")
                .MaximumLength(200).WithMessage("Tiêu đề khóa học không được vượt quá 200 ký tự.");

            RuleFor(x => x.Request.SubjectId)
                .NotEqual(Guid.Empty).WithMessage("SubjectId không hợp lệ.");

            RuleFor(x => x.Request.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Giá khóa học không được âm.");

            RuleFor(x => x.Request.TotalLessons)
                .GreaterThanOrEqualTo(0).WithMessage("Tổng số bài học không được âm.");

            RuleFor(x => x.Request.TotalDuration)
                .GreaterThanOrEqualTo(0).WithMessage("Tổng thời lượng không được âm.");
        }
    }
}

