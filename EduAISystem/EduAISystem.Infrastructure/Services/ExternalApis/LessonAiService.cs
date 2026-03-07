using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Infrastructure.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace EduAISystem.Infrastructure.Services.ExternalApis
{
    /// <summary>
    /// Dịch vụ AI sinh nội dung LessonBlock theo chuẩn sư phạm Việt Nam (cấp 3).
    /// Dùng Gemini API với Structured Output + Chain-of-Thought prompting.
    ///
    /// Cải tiến v3:
    /// - Gemini Structured Output (responseJsonSchema) → API đảm bảo schema, bỏ JSON parsing phức tạp
    /// - Chain-of-Thought prompting → AI suy luận step-by-step trước khi sinh nội dung
    /// - Hướng đến học sinh cấp 3 Việt Nam, sách giáo khoa Việt Nam
    /// - Logging chi tiết + timeout configurable
    /// - Retry + Circuit Breaker qua Polly (DI)
    ///
    /// BlockType: 'Concept' | 'Example' | 'Exercise' | 'Reflection'
    /// </summary>
    public class LessonAiService : ILessonAiService
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiSettings _settings;
        private readonly ILogger<LessonAiService> _logger;

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
            IOptions<GeminiSettings> options,
            ILogger<LessonAiService> logger)
        {
            _httpClient = httpClient;
            _settings = options.Value;
            _logger = logger;
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
                ? "v1beta"
                : _settings.ApiVersion;

            var prompt = BuildChainOfThoughtPrompt(lessonTitle, inputContent);

            // ===== STRUCTURED OUTPUT: API đảm bảo trả đúng schema =====
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
                },
                generationConfig = new
                {
                    responseMimeType = "application/json",
                    responseSchema = BuildResponseSchema()
                }
            };

            var requestJson = JsonSerializer.Serialize(requestBody);
            var apiUrl = $"https://generativelanguage.googleapis.com/{apiVersion}/models/{modelName}:generateContent?key={_settings.ApiKey}";

            // ===== LOGGING: Bắt đầu gọi AI =====
            _logger.LogInformation(
                "[AI] Bắt đầu gọi Gemini API (Structured Output) • Model: {Model} • Lesson: \"{Title}\" • Input length: {InputLength} chars",
                modelName, lessonTitle, inputContent.Length);

            var stopwatch = Stopwatch.StartNew();

            // ===== TIMEOUT: Linked token =====
            var timeoutSeconds = _settings.TimeoutSeconds > 0 ? _settings.TimeoutSeconds : 60;
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.PostAsync(
                    apiUrl,
                    new StringContent(requestJson, Encoding.UTF8, "application/json"),
                    timeoutCts.Token);
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                stopwatch.Stop();
                _logger.LogError(
                    "[AI] ⏰ TIMEOUT sau {Elapsed}ms (giới hạn: {Timeout}s) • Model: {Model} • Lesson: \"{Title}\"",
                    stopwatch.ElapsedMilliseconds, timeoutSeconds, modelName, lessonTitle);
                throw new TimeoutException(
                    $"Gemini API không phản hồi trong {timeoutSeconds}s. Vui lòng thử lại hoặc giảm nội dung đầu vào.");
            }
            catch (HttpRequestException ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex,
                    "[AI] ❌ Lỗi kết nối Gemini API sau {Elapsed}ms • Model: {Model} • Lesson: \"{Title}\"",
                    stopwatch.ElapsedMilliseconds, modelName, lessonTitle);
                throw new InvalidOperationException($"Không thể kết nối Gemini API: {ex.Message}", ex);
            }

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            stopwatch.Stop();

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

                _logger.LogError(
                    "[AI] ❌ Gemini trả lỗi {StatusCode} sau {Elapsed}ms • Model: {Model} • Lesson: \"{Title}\" • Error: {Error}",
                    (int)response.StatusCode, stopwatch.ElapsedMilliseconds, modelName, lessonTitle, errorMessage);

                throw new InvalidOperationException(errorMessage);
            }

            // ===== LOGGING: Phản hồi thành công =====
            _logger.LogInformation(
                "[AI] ✅ Gemini phản hồi thành công sau {Elapsed}ms • Model: {Model} • Response length: {ResponseLength} chars",
                stopwatch.ElapsedMilliseconds, modelName, responseContent.Length);

            // ===== PARSE: Structured Output → đơn giản hóa parsing =====
            try
            {
                using var doc = JsonDocument.Parse(responseContent);

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates)
                    || candidates.GetArrayLength() == 0)
                {
                    _logger.LogWarning("[AI] ⚠️ Gemini response thiếu candidates • Lesson: \"{Title}\"", lessonTitle);
                    throw new InvalidOperationException("Gemini API trả về response không hợp lệ (thiếu candidates).");
                }

                var firstCandidate = candidates[0];
                if (!firstCandidate.TryGetProperty("content", out var content)
                    || !content.TryGetProperty("parts", out var parts)
                    || parts.GetArrayLength() == 0)
                {
                    _logger.LogWarning("[AI] ⚠️ Gemini response thiếu parts • Lesson: \"{Title}\"", lessonTitle);
                    throw new InvalidOperationException("Gemini API response không có nội dung.");
                }

                var aiText = parts[0].TryGetProperty("text", out var textEl)
                    ? textEl.GetString()
                    : null;

                if (string.IsNullOrWhiteSpace(aiText))
                {
                    _logger.LogWarning("[AI] ⚠️ AI trả về text trống • Lesson: \"{Title}\"", lessonTitle);
                    throw new InvalidOperationException("AI trả về nội dung trống.");
                }

                // Structured Output → aiText đã là JSON hợp lệ, parse trực tiếp
                var blocks = ParseStructuredBlocks(aiText);

                _logger.LogInformation(
                    "[AI] 📦 Parse thành công {BlockCount} blocks • Types: [{BlockTypes}] • Lesson: \"{Title}\"",
                    blocks.Count,
                    string.Join(", ", blocks.Select(b => b.BlockType)),
                    lessonTitle);

                return blocks;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex,
                    "[AI] ❌ Lỗi parse JSON từ Gemini • Lesson: \"{Title}\" • Raw (500 chars): {Response}",
                    lessonTitle,
                    responseContent.Length > 500 ? responseContent[..500] : responseContent);

                throw new InvalidOperationException($"Lỗi phân tích kết quả AI: {ex.Message}", ex);
            }
        }

        // =============================================================
        // STRUCTURED OUTPUT SCHEMA
        // Gemini API đảm bảo response tuân thủ schema này
        // → Không cần ExtractJsonFromText, NormalizeBlockType
        // =============================================================
        private static object BuildResponseSchema()
        {
            return new
            {
                type = "object",
                properties = new
                {
                    blocks = new
                    {
                        type = "array",
                        description = "Danh sách blocks sư phạm theo trình tự: Concept → Example → Exercise → Reflection",
                        items = new
                        {
                            type = "object",
                            properties = new
                            {
                                blockType = new
                                {
                                    type = "string",
                                    description = "Loại block sư phạm. Phải theo đúng trình tự: Concept (lý thuyết) → Example (ví dụ) → Exercise (bài tập) → Reflection (suy ngẫm)",
                                    @enum = new[] { "Concept", "Example", "Exercise", "Reflection" }
                                },
                                content = new
                                {
                                    type = "string",
                                    description = "Nội dung chi tiết bằng tiếng Việt, phù hợp học sinh THPT (cấp 3) Việt Nam. Phải tự hoàn chỉnh, đầy đủ, dễ hiểu."
                                },
                                sortOrder = new
                                {
                                    type = "integer",
                                    description = "Thứ tự hiển thị: Concept=1, Example=2, Exercise=3, Reflection=4"
                                },
                                estimatedMinutes = new
                                {
                                    type = "integer",
                                    description = "Thời gian ước tính để học sinh đọc/làm block này (phút)"
                                }
                            },
                            required = new[] { "blockType", "content", "sortOrder", "estimatedMinutes" }
                        }
                    }
                },
                required = new[] { "blocks" }
            };
        }

        // =============================================================
        // CHAIN-OF-THOUGHT PROMPTING
        // AI suy luận step-by-step → nội dung chất lượng cao hơn
        // Tối ưu cho giáo dục Việt Nam, sách giáo khoa cấp 3
        // =============================================================
        private static string BuildChainOfThoughtPrompt(string lessonTitle, string inputContent)
        {
            return $@"Bạn là một chuyên gia thiết kế bài giảng theo chuẩn sư phạm Việt Nam, có kinh nghiệm biên soạn sách giáo khoa THPT (Trung học phổ thông – lớp 10, 11, 12).

Nhiệm vụ: Phân tích nội dung bài học dưới đây và tổ chức lại thành các BLOCKS theo trình tự sư phạm chuẩn.

📖 TIÊU ĐỀ BÀI HỌC: ""{lessonTitle}""

━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 BƯỚC 1: PHÂN TÍCH NỘI DUNG (Chain-of-Thought)
━━━━━━━━━━━━━━━━━━━━━━━━━━
Trước khi tạo blocks, hãy tự phân tích:
- Chủ đề chính của bài là gì?
- Các khái niệm cốt lõi cần truyền đạt cho học sinh cấp 3?
- Kiến thức tiên quyết (prerequisite) học sinh cần biết trước?
- Liên hệ thực tiễn nào phù hợp với đời sống học sinh THPT Việt Nam?
- Mức độ khó phù hợp với chương trình THPT Việt Nam?

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 BƯỚC 2: TẠO BLOCKS THEO CHUẨN SƯ PHẠM
━━━━━━━━━━━━━━━━━━━━━━━━━━
Tạo 4 blocks theo đúng trình tự này:

1️⃣ **Concept** (Khái niệm – sortOrder: 1)
   - Trình bày lý thuyết/khái niệm cốt lõi một cách rõ ràng, mạch lạc
   - Sử dụng ngôn ngữ dễ hiểu phù hợp với học sinh lớp 10-12
   - Kết nối với kiến thức đã học trước đó (nếu có)
   - Nêu rõ định nghĩa, công thức, quy tắc quan trọng
   - Sử dụng in đậm (**) cho thuật ngữ quan trọng
   - Thời gian ước tính: 5-8 phút

2️⃣ **Example** (Ví dụ minh hoạ – sortOrder: 2)
   - Đưa ra 2-3 ví dụ minh hoạ cụ thể, step-by-step
   - Ưu tiên ví dụ liên hệ với đời sống, văn hoá Việt Nam
   - Giải thích rõ từng bước giải (nếu là bài toán/bài tập mẫu)
   - Ví dụ đi từ dễ đến khó
   - Thời gian ước tính: 3-5 phút

3️⃣ **Exercise** (Bài tập thực hành – sortOrder: 3)
   - Thiết kế 3-5 câu hỏi/bài tập có nhiều mức độ:
     • Mức 1 (Nhận biết): câu hỏi cơ bản kiểm tra hiểu khái niệm
     • Mức 2 (Thông hiểu): câu hỏi yêu cầu giải thích, so sánh
     • Mức 3 (Vận dụng): bài tập áp dụng kiến thức vào tình huống cụ thể
   - Mỗi câu hỏi phải rõ ràng, có ngữ cảnh cụ thể
   - Gợi ý đáp án hoặc hướng dẫn giải (nếu phù hợp)
   - Thời gian ước tính: 10-15 phút

4️⃣ **Reflection** (Suy ngẫm – sortOrder: 4)
   - Đặt 2-3 câu hỏi mở kích thích tư duy phản biện
   - Liên hệ kiến thức với thực tiễn đời sống Việt Nam
   - Khuyến khích học sinh tự đánh giá mức độ hiểu bài
   - Gợi ý hướng tìm hiểu thêm hoặc chủ đề liên quan
   - Ví dụ: ""Em hãy suy nghĩ xem kiến thức này có thể áp dụng vào tình huống nào trong đời sống hàng ngày?""
   - Thời gian ước tính: 3-5 phút

━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ QUY TẮC BẮT BUỘC
━━━━━━━━━━━━━━━━━━━━━━━━━━
- TOÀN BỘ nội dung phải bằng TIẾNG VIỆT
- Ngôn ngữ phù hợp với học sinh THPT Việt Nam (lớp 10-12, 16-18 tuổi)
- Mỗi block phải tự hoàn chỉnh, đầy đủ, đọc riêng vẫn hiểu được
- Không dùng ngôn ngữ quá hàn lâm, không dùng tiếng Anh trừ thuật ngữ chuyên ngành
- Thuật ngữ chuyên ngành nên kèm giải thích tiếng Việt
- Ví dụ và bài tập phải phù hợp với bối cảnh Việt Nam
- Phải có đúng 4 blocks theo thứ tự: Concept → Example → Exercise → Reflection

━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 NỘI DUNG CẦN PHÂN TÍCH:
━━━━━━━━━━━━━━━━━━━━━━━━━━
{inputContent}";
        }

        // =============================================================
        // PARSE STRUCTURED OUTPUT → List<GeneratedBlockDto>
        // Với Structured Output, JSON luôn hợp lệ → parse đơn giản
        // Không cần ExtractJsonFromText, NormalizeBlockType nữa
        // =============================================================
        private List<GeneratedBlockDto> ParseStructuredBlocks(string jsonText)
        {
            using var doc = JsonDocument.Parse(jsonText);

            if (!doc.RootElement.TryGetProperty("blocks", out var blocksEl))
            {
                _logger.LogWarning("[AI] ⚠️ Structured output thiếu trường 'blocks', thử parse root array");
                // Fallback: nếu root là array thay vì object
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    return ParseBlockArray(doc.RootElement);
                }
                throw new InvalidOperationException("AI response thiếu trường 'blocks'.");
            }

            return ParseBlockArray(blocksEl);
        }

        private List<GeneratedBlockDto> ParseBlockArray(JsonElement blocksEl)
        {
            var result = new List<GeneratedBlockDto>();
            var sortOrder = 1;

            foreach (var blockEl in blocksEl.EnumerateArray())
            {
                // Với Structured Output + enum constraint, blockType luôn đúng
                var blockType = blockEl.GetProperty("blockType").GetString() ?? "Concept";

                var content = blockEl.GetProperty("content").GetString() ?? string.Empty;

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
    }
}
