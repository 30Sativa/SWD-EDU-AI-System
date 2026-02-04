using EduAISystem.Application.Features.Terms.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Terms.Queries
{
    public class GetTermByIdQuery : IRequest<TermDetailResponseDto?>
    {
        public Guid Id { get; set; }
    }
}

