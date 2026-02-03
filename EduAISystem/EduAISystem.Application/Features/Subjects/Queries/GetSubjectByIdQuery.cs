using EduAISystem.Application.Features.Subjects.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Queries
{
    public class GetSubjectByIdQuery : IRequest<SubjectDetailResponseDto?>
    {
        public Guid Id { get; set; }
    }
}

