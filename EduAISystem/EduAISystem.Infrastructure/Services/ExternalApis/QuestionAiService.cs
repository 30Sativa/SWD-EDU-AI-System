using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using EduAISystem.Infrastructure.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace EduAISystem.Infrastructure.Services.ExternalApis
{
    public class QuestionAiService : IQuestionAiService
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiSettings _settings;
        private readonly ILogger<QuestionAiService> _logger;

        public QuestionAiService(
            HttpClient httpClient,
            IOptions<GeminiSettings> options,
            ILogger<QuestionAiService> logger)
        {
            _httpClient = httpClient;
            _settings = options.Value;
            _logger = logger;
        }

        public async Task<List<AddQuestionRequestDto>> ExtractQuestionsFromTextAsync(string rawText, string modelName = "gemini-2.5-flash")
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                throw new InvalidOperationException("Gemini API key is not configured.");
            }

            var prompt = $@"
Bạn là 1 chuyên gia sư phạm. Hãy trích xuất TẤT CẢ các câu hỏi trắc nghiệm từ văn bản dưới đây.
Bỏ qua các tiêu đề, thông tin nhiễu, chỉ giữ lại câu hỏi và đáp án.
Trả về dữ liệu theo định dạng JSON chuẩn (mảng JSON các câu hỏi). KHÔNG GIẢI THÍCH GÌ THÊM. CHỈ TRẢ VỀ JSON ARRAY.

Định dạng mẫu:
[
  {{
    ""QuestionText"": ""Thủ đô Việt Nam là gì?"",
    ""QuestionType"": ""MultipleChoice"",
    ""Points"": 1,
    ""Explanation"": ""Hà Nội là thủ đô của VN vì..."",
    ""SortOrder"": 1,
    ""Options"": [
       {{ ""OptionText"": ""Hà Nội"", ""IsCorrect"": true, ""SortOrder"": 1 }},
       {{ ""OptionText"": ""Hồ Chí Minh"", ""IsCorrect"": false, ""SortOrder"": 2 }}
    ]
  }}
]

Nội dung văn bản:
{rawText}
";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var requestJson = JsonSerializer.Serialize(requestBody);
            var apiVersion = string.IsNullOrWhiteSpace(_settings.ApiVersion) ? "v1" : _settings.ApiVersion;
            var apiUrl = $"https://generativelanguage.googleapis.com/{apiVersion}/models/{modelName}:generateContent?key={_settings.ApiKey}";
            
            var response = await _httpClient.PostAsync(apiUrl, new StringContent(requestJson, Encoding.UTF8, "application/json"));
            
            if (!response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API error: {response.StatusCode} - {content}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                return new List<AddQuestionRequestDto>();
            }

            var aiText = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

            if (string.IsNullOrWhiteSpace(aiText)) return new List<AddQuestionRequestDto>();

            var jsonText = ExtractJsonFromText(aiText);

            var result = JsonSerializer.Deserialize<List<AddQuestionRequestDto>>(
                jsonText, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            return result ?? new List<AddQuestionRequestDto>();
        }

        private static string ExtractJsonFromText(string text)
        {
            var trimmed = text.Trim();

            var jsonBlockPattern = @"```(?:json)?\s*(.*?)\s*```";
            var match = Regex.Match(trimmed, jsonBlockPattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            
            if (match.Success && match.Groups.Count > 1)
            {
                return match.Groups[1].Value.Trim();
            }

            var startIndex = trimmed.IndexOf('[');
            var endIndex = trimmed.LastIndexOf(']');
            if (startIndex >= 0 && endIndex > startIndex)
            {
                return trimmed.Substring(startIndex, endIndex - startIndex + 1);
            }

            return trimmed;
        }
    }
}
