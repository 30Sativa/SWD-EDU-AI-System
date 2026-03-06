namespace EduAISystem.Application.Features.Lessons.DTOs.Response
{
    public class LessonBlockResponseDto
    {
        public Guid Id { get; init; }
        public Guid LessonId { get; init; }

        /// <summary>Loại block: 'Concept', 'Example', 'Exercise', 'Reflection'</summary>
        public string BlockType { get; init; } = string.Empty;

        public string Content { get; init; } = string.Empty;
        public int SortOrder { get; init; }
        public bool IsRequired { get; init; }
        public int? EstimatedMinutes { get; init; }

        // === AI Metadata ===
        /// <summary>True nếu block được AI sinh ra, false nếu tự nhập thủ công.</summary>
        public bool? IsAiGenerated { get; init; }

        /// <summary>Nguồn AI dùng: 'Text', 'PDF', 'File'. Null nếu là manual.</summary>
        public string? AiSourceType { get; init; }
    }
}

