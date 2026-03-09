using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace EduAISystem.Infrastructure.Services.ExternalApis
{
    public class AiChatService : IAiChatService
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiSettings _settings;
        private readonly ILogger<AiChatService> _logger;
        private readonly IAilogRepository _aiLogRepository;
        private readonly ICurrentUserService _currentUser;

        public AiChatService(
            HttpClient httpClient,
            IOptions<GeminiSettings> options,
            ILogger<AiChatService> logger,
            IAilogRepository aiLogRepository,
            ICurrentUserService currentUser)
        {
            _httpClient = httpClient;
            _settings = options.Value;
            _logger = logger;
            _aiLogRepository = aiLogRepository;
            _currentUser = currentUser;
        }

        public async Task<string> ChatWithLessonAsync(
            string lessonTitle,
            string lessonContent,
            string userMessage,
            List<ChatMessageDto> history,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
                throw new InvalidOperationException("Gemini API key chưa được cấu hình.");

            var modelName = string.IsNullOrWhiteSpace(_settings.ModelName) ? "gemini-2.5-flash" : _settings.ModelName;
            var apiVersion = string.IsNullOrWhiteSpace(_settings.ApiVersion) ? "v1" : _settings.ApiVersion;
            var apiUrl = $"https://generativelanguage.googleapis.com/{apiVersion}/models/{modelName}:generateContent?key={_settings.ApiKey}";

            var systemInstruction = $@"Bạn là AI trợ giảng nhiệt tình, NHIỆM VỤ CHÍNH: CHỈ giải đáp các thắc mắc xoay quanh nội dung bài học.
Tiêu đề bài giảng: {lessonTitle}
Nội dung bài giảng: 
{lessonContent}

Quy tắc:
1. NẾU câu hỏi KHÔNG LIÊN QUAN đến bài học, hãy TỪ CHỐI một cách lịch sự, không trả lời lan man.
2. NẾU câu hỏi LIÊN QUAN, hãy giải đáp ngắn gọn, dễ hiểu cho học sinh THPT.
3. Không bịa đặt thông tin ngoài nội dung được cung cấp.";

            var contents = new List<object>
            {
                new { role = "user", parts = new[] { new { text = systemInstruction } } },
                new { role = "model", parts = new[] { new { text = "Vâng, em đã nhận được yêu cầu và sẽ chỉ trả lời dựa trên nội dung bài học." } } }
            };

            // Cap history to 6 messages
            var recentHistory = history != null ? history.TakeLast(6).ToList() : new List<ChatMessageDto>();
            foreach (var msg in recentHistory)
            {
                contents.Add(new
                {
                    role = msg.Role == "model" ? "model" : "user",
                    parts = new[] { new { text = msg.Content } }
                });
            }

            contents.Add(new { role = "user", parts = new[] { new { text = userMessage } } });

            var requestBody = new
            {
                contents = contents,
                safetySettings = new[]
                {
                    new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_LOW_AND_ABOVE" },
                    new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_LOW_AND_ABOVE" },
                    new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_LOW_AND_ABOVE" },
                    new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_MEDIUM_AND_ABOVE" }
                }
            };

            var requestJson = JsonSerializer.Serialize(requestBody);
            var response = await _httpClient.PostAsync(apiUrl, new StringContent(requestJson, Encoding.UTF8, "application/json"), cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("[AiChatService] Lỗi API: {Error}", responseContent);
                throw new InvalidOperationException($"Không thể nhận câu trả lời từ AI. Error: {(int)response.StatusCode}");
            }

            using var doc = JsonDocument.Parse(responseContent);
            if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                throw new InvalidOperationException("API không trả về khối văn bản nào (candidates rỗng).");
            }

            var aiText = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

            if (doc.RootElement.TryGetProperty("usageMetadata", out var usage))
            {
                var pt = usage.TryGetProperty("promptTokenCount", out var promptTokens) ? promptTokens.GetInt32() : 0;
                var ct = usage.TryGetProperty("candidatesTokenCount", out var compTokens) ? compTokens.GetInt32() : 0;
                var total = pt + ct;
                decimal cost = (pt * 0.075m / 1000000m) + (ct * 0.3m / 1000000m);

                try 
                {
                    if (_currentUser != null && _currentUser.UserId != Guid.Empty)
                    {
                        await _aiLogRepository.AddAsync(new AilogDomain
                        {
                            Id = Guid.NewGuid(),
                            Feature = "ChatWithLesson",
                            UserId = _currentUser.UserId,
                            InputText = $"Lesson: {lessonTitle} | Msg: {userMessage}",
                            OutputText = $"[Cost: ${cost}] {aiText}",
                            TokensUsed = total,
                            Cost = cost,
                            CreatedAt = DateTime.UtcNow
                        }, cancellationToken);
                    }
                } 
                catch (Exception ex) 
                {
                    _logger.LogWarning(ex, "Cannot log AiChat.");
                }
            }

            return aiText ?? string.Empty;
        }
    }
}
