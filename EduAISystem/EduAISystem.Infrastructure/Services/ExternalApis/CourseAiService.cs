using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Infrastructure.Security;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Services.ExternalApis
{
    public class CourseAiService : ICourseAiService
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiSettings _settings;

        public CourseAiService(
            HttpClient httpClient,
            IOptions<GeminiSettings> options)
        {
            _httpClient = httpClient;
            _settings = options.Value;
        }

        public async Task<ScanTemplateCourseResponseDto> AnalyzeStructureAsync(string text)
        {
            // Validate API key
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                throw new InvalidOperationException("Gemini API key is not configured. Please check appsettings.json.");
            }

            // Use default model if not configured
            // Gemini 2.5 Flash is generally available and stable
            // Alternative: gemini-3-flash (preview, latest features)
            var modelName = string.IsNullOrWhiteSpace(_settings.ModelName) 
                ? "gemini-2.5-flash" 
                : _settings.ModelName;
            
            // Try v1 API first, as v1beta might have different model availability
            var apiVersion = string.IsNullOrWhiteSpace(_settings.ApiVersion) 
                ? "v1" 
                : _settings.ApiVersion;

            var prompt = $@"
Phân tích nội dung sau và trả về JSON đúng format:

{{
  ""sections"": [
    {{
      ""title"": ""string"",
      ""sortOrder"": number,
      ""lessons"": [
        {{
          ""title"": ""string"",
          ""sortOrder"": number
        }}
      ]
    }}
  ]
}}

Chỉ trả về JSON. Không giải thích.

Nội dung:
{text}
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

            var apiUrl = $"https://generativelanguage.googleapis.com/{apiVersion}/models/{modelName}:generateContent?key={_settings.ApiKey}";
            
            HttpResponseMessage response;
            try
            {
                response = await _httpClient.PostAsync(
                    apiUrl,
                    new StringContent(requestJson, Encoding.UTF8, "application/json"));
            }
            catch (HttpRequestException ex)
            {
                throw new InvalidOperationException($"Failed to connect to Gemini API: {ex.Message}", ex);
            }

            var responseContent = await response.Content.ReadAsStringAsync();

            // Check if request was successful
            if (!response.IsSuccessStatusCode)
            {
                string errorMessage = $"Gemini API returned status code {(int)response.StatusCode} ({response.StatusCode})";
                
                // Try to extract error details from response
                try
                {
                    using var errorDoc = JsonDocument.Parse(responseContent);
                    if (errorDoc.RootElement.TryGetProperty("error", out var errorElement))
                    {
                        if (errorElement.TryGetProperty("message", out var messageElement))
                        {
                            errorMessage = $"Gemini API Error: {messageElement.GetString()}";
                        }
                        else if (errorElement.TryGetProperty("status", out var statusElement))
                        {
                            errorMessage = $"Gemini API Error: {statusElement.GetString()}";
                        }
                    }
                }
                catch
                {
                    // If we can't parse error, use default message
                }

                throw new InvalidOperationException(errorMessage);
            }

            // Parse successful response
            try
            {
                using var doc = JsonDocument.Parse(responseContent);

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || 
                    candidates.GetArrayLength() == 0)
                {
                    throw new InvalidOperationException("Gemini API returned response without candidates.");
                }

                var firstCandidate = candidates[0];
                if (!firstCandidate.TryGetProperty("content", out var content) ||
                    !content.TryGetProperty("parts", out var parts) ||
                    parts.GetArrayLength() == 0)
                {
                    throw new InvalidOperationException("Gemini API returned invalid response structure.");
                }

                var firstPart = parts[0];
                if (!firstPart.TryGetProperty("text", out var textElement))
                {
                    throw new InvalidOperationException("Gemini API response does not contain text.");
                }

                var aiText = textElement.GetString();

                if (string.IsNullOrWhiteSpace(aiText))
                {
                    throw new InvalidOperationException("AI returned empty response.");
                }

                // Extract JSON from response (may contain markdown code blocks or extra text)
                var jsonText = ExtractJsonFromText(aiText);

                var result = JsonSerializer.Deserialize<ScanTemplateCourseResponseDto>(
                    jsonText,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (result == null)
                {
                    throw new InvalidOperationException("Failed to deserialize AI response.");
                }

                return result;
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse Gemini API response: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Extracts JSON from text that may contain markdown code blocks or extra text
        /// </summary>
        private static string ExtractJsonFromText(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            var trimmed = text.Trim();

            // Try to find JSON in markdown code blocks first
            // Pattern: ```json ... ``` or ``` ... ```
            var jsonBlockPattern = @"```(?:json)?\s*(.*?)\s*```";
            var match = Regex.Match(trimmed, jsonBlockPattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            
            if (match.Success && match.Groups.Count > 1)
            {
                var codeBlockContent = match.Groups[1].Value.Trim();
                // If code block contains JSON, extract it
                var jsonInBlock = ExtractJsonObject(codeBlockContent);
                if (!string.IsNullOrWhiteSpace(jsonInBlock))
                    return jsonInBlock;
            }

            // Try to find JSON object directly in the text
            var jsonObject = ExtractJsonObject(trimmed);
            if (!string.IsNullOrWhiteSpace(jsonObject))
                return jsonObject;

            // If no JSON found, return original text (will fail in deserialization with better error)
            return trimmed;
        }

        /// <summary>
        /// Extracts the first complete JSON object from text by finding matching braces
        /// </summary>
        private static string ExtractJsonObject(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            var startIndex = text.IndexOf('{');
            if (startIndex < 0)
                return string.Empty;

            // Find matching closing brace by counting nested braces
            var braceCount = 0;
            var inString = false;
            var escapeNext = false;
            
            for (int i = startIndex; i < text.Length; i++)
            {
                var ch = text[i];

                if (escapeNext)
                {
                    escapeNext = false;
                    continue;
                }

                if (ch == '\\')
                {
                    escapeNext = true;
                    continue;
                }

                if (ch == '"' && !escapeNext)
                {
                    inString = !inString;
                    continue;
                }

                if (inString)
                    continue;

                if (ch == '{')
                {
                    braceCount++;
                }
                else if (ch == '}')
                {
                    braceCount--;
                    if (braceCount == 0)
                    {
                        // Found matching closing brace
                        return text.Substring(startIndex, i - startIndex + 1);
                    }
                }
            }

            // No matching closing brace found
            return string.Empty;
        }
    }
}
