using EduAISystem.Domain.Enums;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Notifications.DTOs.Request
{
    public class AdminBroadcastNotificationRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public List<UserRoleDomain>? TargetRoles { get; set; }
        public string? Link { get; set; }
    }
}
