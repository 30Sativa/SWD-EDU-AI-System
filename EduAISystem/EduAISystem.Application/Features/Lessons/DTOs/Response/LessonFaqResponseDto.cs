namespace EduAISystem.Application.Features.Lessons.DTOs.Response
{
    public class LessonFaqResponseDto
    {
        public Guid Id { get; init; }
        public Guid LessonId { get; init; }
        public string? Question { get; init; }
        public string? Answer { get; init; }
        public int SortOrder { get; init; }
        public bool IsActive { get; init; }
        public DateTime? CreatedAt { get; init; }
    }
}
