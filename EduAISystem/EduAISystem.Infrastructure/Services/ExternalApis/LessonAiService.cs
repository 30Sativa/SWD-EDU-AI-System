using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

namespace EduAISystem.Infrastructure.Services.ExternalApis
{
    /// <summary>
    /// EduVN AI – Dịch vụ AI sinh nội dung LessonBlock theo chuẩn sư phạm Việt Nam (cấp 3).
    ///
    /// Cải tiến v4:
    /// - System Instruction: tách persona (EduVN AI by ZienK) khỏi content → Gemini cache, giảm token
    /// - Safety Settings: lọc nội dung không phù hợp cho học sinh THPT
    /// - Streaming: endpoint streamGenerateContent → real-time response qua SSE
    /// - Token Tracking: log promptTokenCount/candidatesTokenCount từ usageMetadata
    /// - Structured Output + Chain-of-Thought (giữ từ v3)
    /// - Model: gemini-3.1-pro-preview
    /// </summary>
    public class LessonAiService : ILessonAiService
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiSettings _settings;
        private readonly ILogger<LessonAiService> _logger;
        private readonly IAilogRepository _aiLogRepository;
        private readonly ICurrentUserService _currentUser;

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
            ILogger<LessonAiService> logger,
            IAilogRepository aiLogRepository,
            ICurrentUserService currentUser)
        {
            _httpClient = httpClient;
            _settings = options.Value;
            _logger = logger;
            _aiLogRepository = aiLogRepository;
            _currentUser = currentUser;
        }

        // =============================================================
        // SYSTEM INSTRUCTION — Phần tĩnh, Gemini cache, không thay đổi
        // =============================================================
        private static object BuildSystemInstruction()
        {
            return new
            {
                parts = new[]
                {
                    new
                    {
                        text = @"Bạn là EduVN AI — hệ thống trí tuệ nhân tạo chuyên biệt cho giáo dục Việt Nam, được phát triển và huấn luyện bởi ZienK.

🎓 VỀ BẠN:
- Tên: EduVN AI
- Nhà phát triển: ZienK
- Chuyên môn: Thiết kế bài giảng theo chuẩn sư phạm Việt Nam
- Đối tượng phục vụ: Giáo viên và học sinh THPT (Trung học phổ thông – lớp 10, 11, 12)
- Nếu có ai hỏi bạn là AI nào, model nào, hãy trả lời: ""Tôi là EduVN AI, được phát triển bởi ZienK, chuyên hỗ trợ giáo dục THPT Việt Nam.""

📋 NHIỆM VỤ CHÍNH:
Phân tích nội dung bài học và tổ chức lại thành các BLOCKS theo trình tự sư phạm chuẩn:
1. Concept (Khái niệm) → 2. Example (Ví dụ) → 3. Exercise (Bài tập) → 4. Reflection (Suy ngẫm)

⚠️ QUY TẮC BẮT BUỘC:
- TOÀN BỘ nội dung output phải bằng TIẾNG VIỆT
- Ngôn ngữ phù hợp với học sinh THPT Việt Nam (lớp 10-12, 16-18 tuổi)
- Mỗi block phải tự hoàn chỉnh, đầy đủ, đọc riêng vẫn hiểu được
- Không dùng ngôn ngữ quá hàn lâm
- Thuật ngữ chuyên ngành tiếng Anh phải kèm giải thích tiếng Việt
- Ví dụ và bài tập phải phù hợp với bối cảnh Việt Nam
- Phải có đúng 4 blocks theo thứ tự: Concept → Example → Exercise → Reflection
- KHÔNG được tạo nội dung bạo lực, khiêu dâm, phân biệt đối xử, hoặc không phù hợp với lứa tuổi

📝 CHI TIẾT TỪNG BLOCK:
1️⃣ Concept (sortOrder: 1, ~5-8 phút):
   - Lý thuyết rõ ràng, mạch lạc, dùng **in đậm** cho thuật ngữ quan trọng
   - Kết nối kiến thức đã học, nêu rõ định nghĩa/công thức/quy tắc

2️⃣ Example (sortOrder: 2, ~3-5 phút):
   - 2-3 ví dụ step-by-step, từ dễ đến khó
   - Ưu tiên ví dụ liên hệ đời sống, văn hoá Việt Nam

3️⃣ Exercise (sortOrder: 3, ~10-15 phút):
   - 3-5 câu hỏi/bài tập theo 3 mức:
     • Mức 1 (Nhận biết): kiểm tra hiểu khái niệm
     • Mức 2 (Thông hiểu): giải thích, so sánh
     • Mức 3 (Vận dụng): áp dụng vào tình huống thực tế
   - Gợi ý đáp án nếu phù hợp

4️⃣ Reflection (sortOrder: 4, ~3-5 phút):
   - 2-3 câu hỏi mở, tư duy phản biện
   - Liên hệ thực tiễn đời sống Việt Nam
   - Gợi ý hướng tìm hiểu thêm"
                    }
                }
            };
        }

        // =============================================================
        // SAFETY SETTINGS — Bảo vệ học sinh THPT
        // =============================================================
        private static object[] BuildSafetySettings()
        {
            return new object[]
            {
                new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_LOW_AND_ABOVE" },
                new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_LOW_AND_ABOVE" },
                new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_LOW_AND_ABOVE" },
                new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_MEDIUM_AND_ABOVE" }
            };
        }

        // =============================================================
        // STRUCTURED OUTPUT SCHEMA
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
                                    description = "Loại block sư phạm",
                                    @enum = new[] { "Concept", "Example", "Exercise", "Reflection" }
                                },
                                content = new
                                {
                                    type = "string",
                                    description = "Nội dung chi tiết bằng tiếng Việt, phù hợp học sinh THPT Việt Nam"
                                },
                                sortOrder = new
                                {
                                    type = "integer",
                                    description = "Thứ tự: Concept=1, Example=2, Exercise=3, Reflection=4"
                                },
                                estimatedMinutes = new
                                {
                                    type = "integer",
                                    description = "Thời gian ước tính (phút)"
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
        // CHAIN-OF-THOUGHT PROMPT (phần động, thay đổi mỗi request)
        // =============================================================
        private static string BuildUserPrompt(string lessonTitle, string inputContent)
        {
            return $@"📖 TIÊU ĐỀ BÀI HỌC: ""{lessonTitle}""

🧠 BƯỚC 1: PHÂN TÍCH NỘI DUNG
Trước khi tạo blocks, hãy tự phân tích:
- Chủ đề chính là gì?
- Các khái niệm cốt lõi cần truyền đạt?
- Kiến thức tiên quyết học sinh cần biết?
- Liên hệ thực tiễn phù hợp với THPT Việt Nam?
- Mức độ khó phù hợp?

📋 BƯỚC 2: TẠO 4 BLOCKS theo chuẩn sư phạm đã được hướng dẫn.

📥 NỘI DUNG CẦN PHÂN TÍCH:
{inputContent}";
        }

        // =============================================================
        // Helper: Tạo model/api config
        // =============================================================
        private (string modelName, string apiVersion, int timeoutSeconds) GetConfig()
        {
            var modelName = string.IsNullOrWhiteSpace(_settings.ModelName)
                ? "gemini-3.1-pro-preview"
                : _settings.ModelName;
            var apiVersion = string.IsNullOrWhiteSpace(_settings.ApiVersion)
                ? "v1beta"
                : _settings.ApiVersion;
            var timeoutSeconds = _settings.TimeoutSeconds > 0 ? _settings.TimeoutSeconds : 120;
            return (modelName, apiVersion, timeoutSeconds);
        }

        // =============================================================
        // Helper: Tạo request body (dùng chung cho cả streaming & non-streaming)
        // =============================================================
        private object BuildRequestBody(string lessonTitle, string inputContent, bool includeSchema)
        {
            var userPrompt = BuildUserPrompt(lessonTitle, inputContent);

            if (includeSchema)
            {
                return new
                {
                    systemInstruction = BuildSystemInstruction(),
                    contents = new[]
                    {
                        new { parts = new[] { new { text = userPrompt } } }
                    },
                    safetySettings = BuildSafetySettings(),
                    generationConfig = new
                    {
                        responseMimeType = "application/json",
                        responseSchema = BuildResponseSchema()
                    }
                };
            }

            // Streaming: không dùng Structured Output (stream trả text thuần)
            return new
            {
                systemInstruction = BuildSystemInstruction(),
                contents = new[]
                {
                    new { parts = new[] { new { text = userPrompt + "\n\nTrả về JSON theo format blocks đã quy định." } } }
                },
                safetySettings = BuildSafetySettings()
            };
        }

        // =============================================================
        // NON-STREAMING: GenerateBlocksAsync (giữ nguyên flow cũ)
        // =============================================================
        public async Task<List<GeneratedBlockDto>> GenerateBlocksAsync(
            string inputContent,
            string lessonTitle,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
                throw new InvalidOperationException("Gemini API key chưa được cấu hình. Kiểm tra appsettings.json.");

            var (modelName, apiVersion, timeoutSeconds) = GetConfig();
            var requestBody = BuildRequestBody(lessonTitle, inputContent, includeSchema: true);
            var requestJson = JsonSerializer.Serialize(requestBody);

            var apiUrl = $"https://generativelanguage.googleapis.com/{apiVersion}/models/{modelName}:generateContent?key={_settings.ApiKey}";

            _logger.LogInformation(
                "[EduVN AI] 🚀 Bắt đầu gọi Gemini (Structured Output) • Model: {Model} • Lesson: \"{Title}\" • Input: {InputLength} chars",
                modelName, lessonTitle, inputContent.Length);

            var stopwatch = Stopwatch.StartNew();

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
                    "[EduVN AI] ⏰ TIMEOUT sau {Elapsed}ms (giới hạn: {Timeout}s) • Model: {Model}",
                    stopwatch.ElapsedMilliseconds, timeoutSeconds, modelName);
                throw new TimeoutException(
                    $"EduVN AI không phản hồi trong {timeoutSeconds}s. Vui lòng thử lại hoặc giảm nội dung đầu vào.");
            }
            catch (HttpRequestException ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex,
                    "[EduVN AI] ❌ Lỗi kết nối sau {Elapsed}ms • Model: {Model}",
                    stopwatch.ElapsedMilliseconds, modelName);
                throw new InvalidOperationException($"Không thể kết nối EduVN AI: {ex.Message}", ex);
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
                        errorMessage = $"EduVN AI Error: {msgEl.GetString()}";
                }
                catch { }

                _logger.LogError(
                    "[EduVN AI] ❌ Lỗi {StatusCode} sau {Elapsed}ms • Model: {Model} • Error: {Error}",
                    (int)response.StatusCode, stopwatch.ElapsedMilliseconds, modelName, errorMessage);
                throw new InvalidOperationException(errorMessage);
            }

            _logger.LogInformation(
                "[EduVN AI] ✅ Phản hồi thành công sau {Elapsed}ms • Model: {Model} • Response: {Len} chars",
                stopwatch.ElapsedMilliseconds, modelName, responseContent.Length);

            // Parse response
            try
            {
                using var doc = JsonDocument.Parse(responseContent);

                // ===== TOKEN TRACKING =====
                if (doc.RootElement.TryGetProperty("usageMetadata", out var usage))
                {
                    var promptTokens = usage.TryGetProperty("promptTokenCount", out var pt) ? pt.GetInt32() : 0;
                    var outputTokens = usage.TryGetProperty("candidatesTokenCount", out var ct2) ? ct2.GetInt32() : 0;
                    var totalTokens = promptTokens + outputTokens;

                    _logger.LogInformation(
                        "[EduVN AI] 💰 Tokens: input={Input} output={Output} total={Total} • Lesson: \"{Title}\"",
                        promptTokens, outputTokens, totalTokens, lessonTitle);

                    try
                    {
                        Guid? userId = _currentUser.UserId != Guid.Empty ? _currentUser.UserId : null;

                        // Giá tham khảo: gemini-3.1-pro-preview: $0.075 / 1M input, $0.30 / 1M output
                        decimal cost = (promptTokens * 0.075m / 1000000m) + (outputTokens * 0.3m / 1000000m);

                        await _aiLogRepository.AddAsync(new AilogDomain
                        {
                            Feature = "GenerateLessonBlocks",
                            UserId = userId,
                            InputText = $"Lesson: {lessonTitle} (Length: {inputContent.Length})",
                            OutputText = $"Response length: {responseContent.Length}",
                            TokensUsed = totalTokens,
                            Cost = cost
                        });
                    }
                    catch (Exception logEx)
                    {
                        _logger.LogWarning(logEx, "[EduVN AI] ⚠️ Không thể lưu token tracking vào DB.");
                    }
                }

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates)
                    || candidates.GetArrayLength() == 0)
                {
                    _logger.LogWarning("[EduVN AI] ⚠️ Response thiếu candidates • Lesson: \"{Title}\"", lessonTitle);
                    throw new InvalidOperationException("EduVN AI trả về response không hợp lệ.");
                }

                var firstCandidate = candidates[0];
                if (!firstCandidate.TryGetProperty("content", out var content)
                    || !content.TryGetProperty("parts", out var parts)
                    || parts.GetArrayLength() == 0)
                {
                    _logger.LogWarning("[EduVN AI] ⚠️ Response thiếu parts • Lesson: \"{Title}\"", lessonTitle);
                    throw new InvalidOperationException("EduVN AI response không có nội dung.");
                }

                var aiText = parts[0].TryGetProperty("text", out var textEl)
                    ? textEl.GetString() : null;

                if (string.IsNullOrWhiteSpace(aiText))
                    throw new InvalidOperationException("EduVN AI trả về nội dung trống.");

                var blocks = ParseStructuredBlocks(aiText);

                _logger.LogInformation(
                    "[EduVN AI] 📦 Parse thành công {Count} blocks • Types: [{Types}] • Lesson: \"{Title}\"",
                    blocks.Count, string.Join(", ", blocks.Select(b => b.BlockType)), lessonTitle);

                return blocks;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex,
                    "[EduVN AI] ❌ Lỗi parse JSON • Lesson: \"{Title}\" • Raw (500): {Resp}",
                    lessonTitle, responseContent.Length > 500 ? responseContent[..500] : responseContent);
                throw new InvalidOperationException($"Lỗi phân tích kết quả AI: {ex.Message}", ex);
            }
        }

        // =============================================================
        // STREAMING: GenerateBlocksStreamAsync
        // Dùng Gemini streamGenerateContent → trả từng chunk qua SSE
        // =============================================================
        public async IAsyncEnumerable<string> GenerateBlocksStreamAsync(
            string inputContent,
            string lessonTitle,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
                throw new InvalidOperationException("Gemini API key chưa được cấu hình.");

            var (modelName, apiVersion, timeoutSeconds) = GetConfig();
            var requestBody = BuildRequestBody(lessonTitle, inputContent, includeSchema: false);
            var requestJson = JsonSerializer.Serialize(requestBody);

            // ===== streamGenerateContent — Gemini streaming endpoint =====
            var apiUrl = $"https://generativelanguage.googleapis.com/{apiVersion}/models/{modelName}:streamGenerateContent?alt=sse&key={_settings.ApiKey}";

            _logger.LogInformation(
                "[EduVN AI] 🔴 STREAM bắt đầu • Model: {Model} • Lesson: \"{Title}\" • Input: {Len} chars",
                modelName, lessonTitle, inputContent.Length);

            var stopwatch = Stopwatch.StartNew();

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            HttpResponseMessage response;
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, apiUrl)
                {
                    Content = new StringContent(requestJson, Encoding.UTF8, "application/json")
                };
                response = await _httpClient.SendAsync(
                    request,
                    HttpCompletionOption.ResponseHeadersRead,
                    timeoutCts.Token);
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogError("[EduVN AI] ⏰ STREAM TIMEOUT sau {Elapsed}ms", stopwatch.ElapsedMilliseconds);
                throw new TimeoutException($"EduVN AI stream timeout ({timeoutSeconds}s).");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "[EduVN AI] ❌ STREAM lỗi kết nối sau {Elapsed}ms", stopwatch.ElapsedMilliseconds);
                throw new InvalidOperationException($"Không thể kết nối EduVN AI: {ex.Message}", ex);
            }

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("[EduVN AI] ❌ STREAM lỗi {Status}: {Error}",
                    (int)response.StatusCode, errorBody.Length > 300 ? errorBody[..300] : errorBody);
                throw new InvalidOperationException($"EduVN AI stream error: {(int)response.StatusCode}");
            }

            // ===== Đọc SSE stream =====
            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var reader = new StreamReader(stream);

            var totalChunks = 0;

            while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
            {
                var line = await reader.ReadLineAsync(cancellationToken);

                if (string.IsNullOrEmpty(line)) continue;

                // SSE format: "data: {json}"
                if (!line.StartsWith("data: ")) continue;

                var jsonData = line["data: ".Length..];
                if (jsonData == "[DONE]") break;

                // Parse chunk: extract text và token tracking
                // yield return phải nằm NGOÀI try/catch (CS1626)
                string? pendingChunk = null;

                try
                {
                    using var doc = JsonDocument.Parse(jsonData);

                    // ===== STREAM TOKEN TRACKING (Thường nằm ở chunk cuối) =====
                    if (doc.RootElement.TryGetProperty("usageMetadata", out var usage))
                    {
                        var promptTokens = usage.TryGetProperty("promptTokenCount", out var pt) ? pt.GetInt32() : 0;
                        var outputTokens = usage.TryGetProperty("candidatesTokenCount", out var ct2) ? ct2.GetInt32() : 0;
                        var totalTokens  = promptTokens + outputTokens;

                        _logger.LogInformation(
                            "[EduVN AI] 💰 STREAM Tokens: input={Input} output={Output} total={Total} • Lesson: \"{Title}\"",
                            promptTokens, outputTokens, totalTokens, lessonTitle);

                        Guid? userId = _currentUser.UserId != Guid.Empty ? _currentUser.UserId : null;
                        decimal cost = (promptTokens * 0.075m / 1000000m) + (outputTokens * 0.3m / 1000000m);

                        // Fire-and-forget — không dùng await vì iterator không cho yield trong try/catch
                        _ = _aiLogRepository.AddAsync(new AilogDomain
                        {
                            Feature    = "GenerateLessonBlocksStream",
                            UserId     = userId,
                            InputText  = $"Lesson: {lessonTitle} (Length: {inputContent.Length})",
                            OutputText = $"Stream ended. Chunks: {totalChunks}",
                            TokensUsed = totalTokens,
                            Cost       = cost
                        }).ConfigureAwait(false);
                    }

                    // Extract text chunk
                    if (doc.RootElement.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                    {
                        var first = candidates[0];
                        if (first.TryGetProperty("content", out var content) &&
                            content.TryGetProperty("parts", out var parts) &&
                            parts.GetArrayLength() > 0 &&
                            parts[0].TryGetProperty("text", out var textEl))
                        {
                            pendingChunk = textEl.GetString();
                        }
                    }
                }
                catch (JsonException) { }

                // yield NGOÀI try/catch để tránh CS1626
                if (!string.IsNullOrEmpty(pendingChunk))
                {
                    totalChunks++;
                    yield return pendingChunk;
                }
            }

            stopwatch.Stop();
            _logger.LogInformation(
                "[EduVN AI] 🟢 STREAM hoàn thành sau {Elapsed}ms • {Chunks} chunks • Lesson: \"{Title}\"",
                stopwatch.ElapsedMilliseconds, totalChunks, lessonTitle);
        }


        // =============================================================
        // PARSE STRUCTURED OUTPUT
        // =============================================================
        private List<GeneratedBlockDto> ParseStructuredBlocks(string jsonText)
        {
            using var doc = JsonDocument.Parse(jsonText);

            if (!doc.RootElement.TryGetProperty("blocks", out var blocksEl))
            {
                _logger.LogWarning("[EduVN AI] ⚠️ Thiếu 'blocks', thử parse root array");
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    return ParseBlockArray(doc.RootElement);
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
                var blockType = blockEl.GetProperty("blockType").GetString() ?? "Concept";
                var content = blockEl.GetProperty("content").GetString() ?? string.Empty;

                var order = blockEl.TryGetProperty("sortOrder", out var soEl) && soEl.TryGetInt32(out var soVal)
                    ? soVal : sortOrder;

                var minutes = blockEl.TryGetProperty("estimatedMinutes", out var emEl) && emEl.TryGetInt32(out var emVal)
                    ? emVal : DefaultEstimatedMinutes.GetValueOrDefault(blockType, 5);

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
