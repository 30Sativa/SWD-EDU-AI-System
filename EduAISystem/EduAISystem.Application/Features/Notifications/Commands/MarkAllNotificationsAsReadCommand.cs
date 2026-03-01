using MediatR;

namespace EduAISystem.Application.Features.Notifications.Commands
{
    public record MarkAllNotificationsAsReadCommand : IRequest<Unit>;
}
