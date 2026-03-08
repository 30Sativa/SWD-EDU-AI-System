using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.AiChat.DTOs.Response;
using EduAISystem.Application.Features.AiChat.Queries;
using MediatR;
using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.AiChat.Handlers
{
    public class ChatWithLessonQueryHandler : IRequestHandler<ChatWithLessonQuery, ChatWithLessonResponseDto>
    {
        private readonly IAiChatService _aiChatService;
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonBlockRepository _lessonBlockRepository;

        public ChatWithLessonQueryHandler(
            IAiChatService aiChatService,
            ILessonRepository lessonRepository,
            ILessonBlockRepository lessonBlockRepository)
        {
            _aiChatService = aiChatService;
            _lessonRepository = lessonRepository;
            _lessonBlockRepository = lessonBlockRepository;
        }

        public async Task<ChatWithLessonResponseDto> Handle(ChatWithLessonQuery request, CancellationToken cancellationToken)
        {
            var lesson = await _lessonRepository.GetByIdAsync(request.LessonId);
            if (lesson == null)
            {
                throw new InvalidOperationException("Không tìm thấy bài học.");
            }

            var blocks = await _lessonBlockRepository.GetByLessonIdAsync(request.LessonId, cancellationToken);
            var lessonContentBuilder = new StringBuilder();
            foreach (var block in blocks.OrderBy(b => b.SortOrder))
            {
                lessonContentBuilder.AppendLine($"[{block.BlockType}]: {block.Content}");
            }

            var lessonContent = lessonContentBuilder.ToString();
            if (string.IsNullOrWhiteSpace(lessonContent))
            {
                throw new InvalidOperationException("Bài học này chưa có nội dung để AI phân tích.");
            }

            var reply = await _aiChatService.ChatWithLessonAsync(
                lessonTitle: lesson.Title,
                lessonContent: lessonContent,
                userMessage: request.Request.Message,
                history: request.Request.History ?? new List<ChatMessageDto>(),
                cancellationToken: cancellationToken);

            return new ChatWithLessonResponseDto
            {
                Reply = reply
            };
        }
    }
}
