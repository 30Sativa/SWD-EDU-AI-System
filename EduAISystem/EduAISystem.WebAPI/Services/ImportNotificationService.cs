using EduAISystem.Application.Abstractions.Common;
using EduAISystem.WebAPI.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace EduAISystem.WebAPI.Services
{
    public class ImportNotificationService : IImportNotificationService
    {
        private readonly IHubContext<ImportHub> _hubContext;

        public ImportNotificationService(IHubContext<ImportHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyProgressAsync(string jobId, int progressPercent, string message)
        {
            await _hubContext.Clients.Group(jobId).SendAsync("ReceiveProgress", new
            {
                JobId = jobId,
                Percent = progressPercent,
                Message = message,
                Status = "PROCESSING"
            });
        }

        public async Task NotifyCompletedAsync(string jobId, int importedCount, string message)
        {
            await _hubContext.Clients.Group(jobId).SendAsync("ReceiveCompleted", new
            {
                JobId = jobId,
                Percent = 100,
                Message = message,
                ImportedCount = importedCount,
                Status = "COMPLETED"
            });
        }

        public async Task NotifyErrorAsync(string jobId, string errorMessage)
        {
            await _hubContext.Clients.Group(jobId).SendAsync("ReceiveError", new
            {
                JobId = jobId,
                Message = errorMessage,
                Status = "FAILED"
            });
        }
    }
}
