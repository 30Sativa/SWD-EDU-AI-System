using EduAISystem.Application.Abstractions.Persistence;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.AiChat.DTOs.Request
{
    public class ChatWithLessonRequestDto
    {
        public string Message { get; set; } = string.Empty;
        
        /// <summary>
        /// Danh sách tin nhắn trước đó. Element có thể là { "Role": "user", "Content": "..." } hoặc { "Role": "model", "Content": "..." }
        /// </summary>
        public List<ChatMessageDto>? History { get; set; }
    }
}
