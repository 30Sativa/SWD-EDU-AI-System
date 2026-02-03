using EduAISystem.Application.Features.Subjects.DTOs.Request;
using EduAISystem.Application.Features.Subjects.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Commands
{
    public class CreateSubjectCommand : IRequest<SubjectDetailResponseDto>
    {
        public CreateSubjectRequestDto Request { get; set; } = null!;
    }
}

