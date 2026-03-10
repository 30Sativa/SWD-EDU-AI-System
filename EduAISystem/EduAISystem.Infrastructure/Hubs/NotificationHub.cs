using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        // SignalR tự động map UserId từ ClaimTypes.NameIdentifier nếu được cấu hình
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }
    }
}
