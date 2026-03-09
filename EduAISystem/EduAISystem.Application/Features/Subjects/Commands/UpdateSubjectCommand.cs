using EduAISystem.Application.Features.Subjects.DTOs.Request;
using EduAISystem.Application.Features.Subjects.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Commands
{
    public class UpdateSubjectCommand : IRequest<SubjectDetailResponseDto?>
    {
        public Guid Id { get; set; }
        public UpdateSubjectRequestDto Request { get; set; } = null!;
    }
}

