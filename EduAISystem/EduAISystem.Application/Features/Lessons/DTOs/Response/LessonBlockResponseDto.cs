namespace EduAISystem.Application.Features.Lessons.DTOs.Response
{
    public class LessonBlockResponseDto
    {
        public Guid Id { get; init; }
        public Guid LessonId { get; init; }
        public string BlockType { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
        public int SortOrder { get; init; }
        public bool IsRequired { get; init; }
        public int? EstimatedMinutes { get; init; }
    }
}
