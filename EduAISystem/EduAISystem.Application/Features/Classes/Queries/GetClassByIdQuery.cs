using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Queries
{
    public class GetClassByIdQuery : IRequest<ClassDetailResponseDto?>
    {
        public Guid Id { get; set; }
    }
}

