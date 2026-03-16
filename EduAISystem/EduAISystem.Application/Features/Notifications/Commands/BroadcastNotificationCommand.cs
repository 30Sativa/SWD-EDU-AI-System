using EduAISystem.Application.Features.Notifications.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Notifications.Commands
{
    public class BroadcastNotificationCommand : IRequest<Unit>
    {
        public AdminBroadcastNotificationRequestDto Request { get; set; }

        public BroadcastNotificationCommand(AdminBroadcastNotificationRequestDto request)
        {
            Request = request;
        }
    }
}
