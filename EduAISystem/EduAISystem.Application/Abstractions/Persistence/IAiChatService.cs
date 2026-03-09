using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public class ChatMessageDto
    {
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public interface IAiChatService
    {
        Task<string> ChatWithLessonAsync(
            string lessonTitle,
            string lessonContent,
            string userMessage,
            List<ChatMessageDto> history,
            CancellationToken cancellationToken = default);
    }
}
