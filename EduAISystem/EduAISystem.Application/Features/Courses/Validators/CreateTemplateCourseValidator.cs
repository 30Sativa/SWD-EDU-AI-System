using EduAISystem.Application.Features.Courses.Commands;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.Validators
{
    public class CreateTemplateCourseValidator : AbstractValidator<CreateTemplateCourseCommand>
    {
        public CreateTemplateCourseValidator() 
        {
            RuleFor(x => x.Request.SubjectId).NotEmpty().WithMessage("SubjectId không được để trống.");
        }
    }
}
