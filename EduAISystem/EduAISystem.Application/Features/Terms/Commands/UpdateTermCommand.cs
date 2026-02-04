using EduAISystem.Application.Features.Terms.DTOs.Request;
using EduAISystem.Application.Features.Terms.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Commands
{
    public class UpdateTermCommand : IRequest<TermDetailResponseDto?>
    {
        public Guid Id { get; set; }
        public UpdateTermRequestDto Request { get; set; } = null!;
    }
}

