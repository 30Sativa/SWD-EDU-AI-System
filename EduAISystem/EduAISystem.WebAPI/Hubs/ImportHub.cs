using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace EduAISystem.WebAPI.Hubs
{
    public class ImportHub : Hub
    {
        // Nhóm theo jobId hoặc userId
        public async Task JoinJobGroup(string jobId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, jobId);
        }

        public async Task LeaveJobGroup(string jobId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, jobId);
        }
    }
}
