using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Queries
{
    public class GetCourseCategoryByIdQuery : IRequest<CourseCategoryDetailResponseDto?>
    {
        public Guid Id { get; set; }
    }
}

