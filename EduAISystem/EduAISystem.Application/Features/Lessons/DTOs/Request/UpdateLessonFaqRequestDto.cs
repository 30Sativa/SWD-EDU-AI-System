namespace EduAISystem.Application.Features.Lessons.DTOs.Request
{
    public class UpdateLessonFaqRequestDto
    {
        public string? Question { get; set; }
        public string? Answer { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsActive { get; set; }
    }
}
