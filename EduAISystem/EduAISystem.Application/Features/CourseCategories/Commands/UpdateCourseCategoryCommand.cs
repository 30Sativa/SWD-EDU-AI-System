using EduAISystem.Application.Features.CourseCategories.DTOs.Request;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Commands
{
    public class UpdateCourseCategoryCommand : IRequest<CourseCategoryDetailResponseDto?>
    {
        public Guid Id { get; set; }
        public UpdateCourseCategoryRequestDto Request { get; set; } = null!;
    }
}

