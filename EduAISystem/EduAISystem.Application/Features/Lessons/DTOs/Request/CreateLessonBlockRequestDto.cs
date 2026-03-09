namespace EduAISystem.Application.Features.Lessons.DTOs.Request
{
    public class CreateLessonBlockRequestDto
    {
        public string BlockType { get; set; } = null!; // e.g. "Text", "Video", "Image", "Quiz", "File"
        public string Content { get; set; } = null!;
        public int SortOrder { get; set; }
        public bool? IsRequired { get; set; } = true;
        public int? EstimatedMinutes { get; set; }
    }
}
