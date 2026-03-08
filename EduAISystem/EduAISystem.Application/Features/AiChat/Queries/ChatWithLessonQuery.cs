using EduAISystem.Application.Features.AiChat.DTOs.Request;
using EduAISystem.Application.Features.AiChat.DTOs.Response;
using MediatR;
using System;

namespace EduAISystem.Application.Features.AiChat.Queries
{
    public class ChatWithLessonQuery : IRequest<ChatWithLessonResponseDto>
    {
        public Guid LessonId { get; set; }
        public ChatWithLessonRequestDto Request { get; set; } = null!;
    }
}
