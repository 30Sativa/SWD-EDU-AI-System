namespace EduAISystem.Application.Features.Quiz.DTOs.Request
{
    public class CreateQuizRequestDto
    {
        public Guid LessonId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; } = null!;
        public int? TimeLimit { get; set; } = 0;
        public int? MaxAttempts { get; set; } = 1;
        public decimal? PassingScore { get; set; } = 70;
        public bool? IsPublished { get; set; } = false;
        public bool? IsActive { get; set; } = true;
        public bool? IsRequired { get; set; } = false;
        public bool? ShowAnswers { get; set; } = true;
        public bool? ShuffleQuestions { get; set; } = false;
    }
}
