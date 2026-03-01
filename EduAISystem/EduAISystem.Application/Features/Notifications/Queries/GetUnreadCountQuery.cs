using MediatR;

namespace EduAISystem.Application.Features.Notifications.Queries
{
    public record GetUnreadCountQuery : IRequest<int>;
}
