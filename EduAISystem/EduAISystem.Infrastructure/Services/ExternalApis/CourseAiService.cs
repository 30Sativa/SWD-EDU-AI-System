using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Infrastructure.Security;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Services.ExternalApis
{
    public class CourseAiService : ICourseAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public CourseAiService(
            HttpClient httpClient,
            IOptions<GeminiSettings> options)
        {
            _httpClient = httpClient;
            _apiKey = options.Value.ApiKey;
        }

        public async Task<ScanTemplateCourseResponseDto> AnalyzeStructureAsync(string text)
        {
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

            var response = await _httpClient.PostAsync(
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}",
                new StringContent(requestJson, Encoding.UTF8, "application/json"));

            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(responseContent);

            var aiText = doc
                .RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(aiText))
                throw new Exception("AI returned empty response.");

            return JsonSerializer.Deserialize<ScanTemplateCourseResponseDto>(
                aiText,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                })!;
        }
    }
}
