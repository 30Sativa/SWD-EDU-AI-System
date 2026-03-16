using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Domain.Entities;
using MediatR;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Common
{
    public interface IImportNotificationService
    {
        Task NotifyProgressAsync(string jobId, int progressPercent, string message);
        Task NotifyCompletedAsync(string jobId, int importedCount, string message);
        Task NotifyErrorAsync(string jobId, string errorMessage);
    }
}
