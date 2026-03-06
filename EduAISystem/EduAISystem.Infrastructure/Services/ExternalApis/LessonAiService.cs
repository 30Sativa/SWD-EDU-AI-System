using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Infrastructure.Security;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace EduAISystem.Infrastructure.Services.ExternalApis
{
    /// <summary>
    /// Dịch vụ AI sinh nội dung LessonBlock theo chuẩn sư phạm.
    /// Dùng Gemini API (Flash model) với prompt được thiết kế chuyên biệt cho giáo dục.
    ///
    /// BlockType hợp lệ: 'Concept' | 'Example' | 'Exercise' | 'Reflection'
    /// </summary>
    public class LessonAiService : ILessonAiService
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiSettings _settings;

        // Số phút ước tính mặc định theo từng loại block
        private static readonly Dictionary<string, int> DefaultEstimatedMinutes = new()
        {
            { "Concept",    5  },
            { "Example",    3  },
            { "Exercise",   10 },
            { "Reflection", 3  }
        };

        public LessonAiService(
            HttpClient httpClient,
            IOptions<GeminiSettings> options)
        {
            _httpClient = httpClient;
            _settings = options.Value;
        }

        public async Task<List<GeneratedBlockDto>> GenerateBlocksAsync(
            string inputContent,
            string lessonTitle,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
                throw new InvalidOperationException("Gemini API key chưa được cấu hình. Kiểm tra appsettings.json.");

            var modelName = string.IsNullOrWhiteSpace(_settings.ModelName)
                ? "gemini-2.5-flash"
                : _settings.ModelName;

            var apiVersion = string.IsNullOrWhiteSpace(_settings.ApiVersion)
                ? "v1"
                : _settings.ApiVersion;

            var prompt = BuildPedagogicalPrompt(lessonTitle, inputContent);

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
            var apiUrl = $"https://generativelanguage.googleapis.com/{apiVersion}/models/{modelName}:generateContent?key={_settings.ApiKey}";

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.PostAsync(
                    apiUrl,
                    new StringContent(requestJson, Encoding.UTF8, "application/json"),
                    cancellationToken);
            }
            catch (HttpRequestException ex)
            {
                throw new InvalidOperationException($"Không thể kết nối Gemini API: {ex.Message}", ex);
            }

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorMessage = $"Gemini API trả về lỗi {(int)response.StatusCode}";
                try
                {
                    using var errorDoc = JsonDocument.Parse(responseContent);
                    if (errorDoc.RootElement.TryGetProperty("error", out var errorEl)
                        && errorEl.TryGetProperty("message", out var msgEl))
                        errorMessage = $"Gemini API Error: {msgEl.GetString()}";
                }
                catch { }
                throw new InvalidOperationException(errorMessage);
            }

            // Parse response
            try
            {
                using var doc = JsonDocument.Parse(responseContent);

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates)
                    || candidates.GetArrayLength() == 0)
                    throw new InvalidOperationException("Gemini API trả về response không hợp lệ (thiếu candidates).");

                var firstCandidate = candidates[0];
                if (!firstCandidate.TryGetProperty("content", out var content)
                    || !content.TryGetProperty("parts", out var parts)
                    || parts.GetArrayLength() == 0)
                    throw new InvalidOperationException("Gemini API response không có nội dung.");

                var aiText = parts[0].TryGetProperty("text", out var textEl)
                    ? textEl.GetString()
                    : null;

                if (string.IsNullOrWhiteSpace(aiText))
                    throw new InvalidOperationException("AI trả về nội dung trống.");

                return ParseBlocksFromAiResponse(aiText);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Lỗi phân tích kết quả AI: {ex.Message}", ex);
            }
        }

        // =========================================================
        // PROMPT ENGINEERING – Chuẩn sư phạm
        // =========================================================
        private static string BuildPedagogicalPrompt(string lessonTitle, string inputContent)
        {
            return $@"
Bạn là một chuyên gia thiết kế bài học theo chuẩn sư phạm.
Nhiệm vụ: phân tích nội dung bài học và tổ chức lại thành các BLOCKS theo trình tự sư phạm chuẩn.

Tiêu đề bài học: ""{lessonTitle}""

TRÌNH TỰ SƯ PHẠM BẮT BUỘC (theo đúng thứ tự này):
1. Concept   – Giải thích khái niệm/lý thuyết cốt lõi, ngôn ngữ rõ ràng, học sinh có thể hiểu ngay
2. Example   – Ví dụ minh họa cụ thể, thực tế, sinh động, liên hệ với cuộc sống hoặc môn học
3. Exercise  – Bài tập/câu hỏi kiểm tra hiểu biết. Phải có câu hỏi rõ ràng để học sinh thực hành  
4. Reflection– Câu hỏi tư duy sâu, liên hệ thực tiễn, khuyến khích học sinh suy ngẫm

QUY TẮC:
- Mỗi block phải đầy đủ, tự hoàn chỉnh
- Ngôn ngữ: Tiếng Việt, phù hợp với học sinh
- Exercise phải là bài tập/câu hỏi thực tế (không phải lý thuyết)
- Reflection phải là câu hỏi mở, kích thích tư duy

Chỉ trả về JSON theo đúng format này, KHÔNG giải thích thêm:

{{
  ""blocks"": [
    {{
      ""blockType"": ""Concept"",
      ""content"": ""[Nội dung lý thuyết đầy đủ]"",
      ""sortOrder"": 1,
      ""estimatedMinutes"": 5
    }},
    {{
      ""blockType"": ""Example"",
      ""content"": ""[Ví dụ minh họa cụ thể]"",
      ""sortOrder"": 2,
      ""estimatedMinutes"": 3
    }},
    {{
      ""blockType"": ""Exercise"",
      ""content"": ""[Bài tập/câu hỏi thực hành]"",
      ""sortOrder"": 3,
      ""estimatedMinutes"": 10
    }},
    {{
      ""blockType"": ""Reflection"",
      ""content"": ""[Câu hỏi tư duy sâu]"",
      ""sortOrder"": 4,
      ""estimatedMinutes"": 3
    }}
  ]
}}

Nội dung cần phân tích:
{inputContent}
";
        }

        // =========================================================
        // PARSE AI RESPONSE → List<GeneratedBlockDto>
        // =========================================================
        private static List<GeneratedBlockDto> ParseBlocksFromAiResponse(string aiText)
        {
            var jsonText = ExtractJsonFromText(aiText);

            using var doc = JsonDocument.Parse(jsonText);

            if (!doc.RootElement.TryGetProperty("blocks", out var blocksEl))
                throw new InvalidOperationException("AI response thiếu trường 'blocks'.");

            var result = new List<GeneratedBlockDto>();
            var sortOrder = 1;

            foreach (var blockEl in blocksEl.EnumerateArray())
            {
                var blockType = blockEl.TryGetProperty("blockType", out var btEl)
                    ? btEl.GetString() ?? "Concept"
                    : "Concept";

                // Normalize blockType
                blockType = NormalizeBlockType(blockType);

                var content = blockEl.TryGetProperty("content", out var cEl)
                    ? cEl.GetString() ?? string.Empty
                    : string.Empty;

                var order = blockEl.TryGetProperty("sortOrder", out var soEl) && soEl.TryGetInt32(out var soVal)
                    ? soVal
                    : sortOrder;

                var minutes = blockEl.TryGetProperty("estimatedMinutes", out var emEl) && emEl.TryGetInt32(out var emVal)
                    ? emVal
                    : DefaultEstimatedMinutes.GetValueOrDefault(blockType, 5);

                result.Add(new GeneratedBlockDto
                {
                    BlockType = blockType,
                    Content = content,
                    SortOrder = order,
                    EstimatedMinutes = minutes
                });

                sortOrder++;
            }

            return result.OrderBy(b => b.SortOrder).ToList();
        }

        private static string NormalizeBlockType(string blockType)
        {
            return blockType.Trim().ToLower() switch
            {
                "concept"    => "Concept",
                "example"    => "Example",
                "exercise"   => "Exercise",
                "reflection" => "Reflection",
                _            => "Concept"   // fallback mặc định
            };
        }

        private static string ExtractJsonFromText(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return text;
            var trimmed = text.Trim();

            var match = Regex.Match(trimmed, @"```(?:json)?\s*(.*?)\s*```",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);

            if (match.Success && match.Groups.Count > 1)
            {
                var codeBlock = match.Groups[1].Value.Trim();
                var jsonInBlock = ExtractJsonObject(codeBlock);
                if (!string.IsNullOrWhiteSpace(jsonInBlock)) return jsonInBlock;
            }

            var jsonObject = ExtractJsonObject(trimmed);
            return !string.IsNullOrWhiteSpace(jsonObject) ? jsonObject : trimmed;
        }

        private static string ExtractJsonObject(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;
            var startIndex = text.IndexOf('{');
            if (startIndex < 0) return string.Empty;

            int braceCount = 0;
            bool inString = false, escapeNext = false;

            for (int i = startIndex; i < text.Length; i++)
            {
                var ch = text[i];
                if (escapeNext) { escapeNext = false; continue; }
                if (ch == '\\') { escapeNext = true; continue; }
                if (ch == '"' && !escapeNext) { inString = !inString; continue; }
                if (inString) continue;
                if (ch == '{') braceCount++;
                else if (ch == '}')
                {
                    braceCount--;
                    if (braceCount == 0)
                        return text.Substring(startIndex, i - startIndex + 1);
                }
            }
            return string.Empty;
        }
    }
}
