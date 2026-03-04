namespace EduAISystem.Application.Features.Lessons.DTOs.Request
{
    public class CreateLessonFaqRequestDto
    {
        public string? Question { get; set; }
        public string? Answer { get; set; }
        public int? SortOrder { get; set; } = 0;
    }
}
