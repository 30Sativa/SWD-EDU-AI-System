namespace EduAISystem.Application.Features.Lessons.DTOs.Request
{
    public class UpdateLessonBlockRequestDto
    {
        public string BlockType { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int SortOrder { get; set; }
        public bool? IsRequired { get; set; }
        public int? EstimatedMinutes { get; set; }
    }
}
