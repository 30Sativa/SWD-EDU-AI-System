using EduAISystem.Application.Features.Terms.DTOs.Request;
using EduAISystem.Application.Features.Terms.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Commands
{
    public class CreateTermCommand : IRequest<TermDetailResponseDto>
    {
        public CreateTermRequestDto Request { get; set; } = null!;
    }
}

