using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.CourseCategories.Commands;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Handler
{
    public class SetCourseCategoryStatusCommandHandler : IRequestHandler<SetCourseCategoryStatusCommand, bool>
    {
        private readonly ICourseCategoryRepository _categories;

        public SetCourseCategoryStatusCommandHandler(ICourseCategoryRepository categories)
        {
            _categories = categories;
        }

        public Task<bool> Handle(SetCourseCategoryStatusCommand request, CancellationToken cancellationToken)
        {
            return _categories.SetActiveStatusAsync(request.Id, request.IsActive, cancellationToken);
        }
    }
}

