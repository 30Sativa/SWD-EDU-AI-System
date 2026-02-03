using EduAISystem.Application.Features.CourseCategories.DTOs.Request;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.CourseCategories.Commands
{
    public class CreateCourseCategoryCommand : IRequest<CourseCategoryDetailResponseDto>
    {
        public CreateCourseCategoryRequestDto Request { get; set; } = null!;
    }
}

