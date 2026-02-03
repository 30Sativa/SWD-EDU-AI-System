using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Commands
{
    public class SetCourseCategoryStatusCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public bool IsActive { get; set; }
    }
}

