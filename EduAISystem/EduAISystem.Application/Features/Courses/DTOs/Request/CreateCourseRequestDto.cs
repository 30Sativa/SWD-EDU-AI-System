namespace EduAISystem.Application.Features.Courses.DTOs.Request
{
    public class CreateCourseRequestDto
    {
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }

        public Guid SubjectId { get; set; }
        public Guid? GradeLevelId { get; set; }
        public Guid? CategoryId { get; set; }

        public string? Level { get; set; }
        public string? Language { get; set; } = "vi-VN";

        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }

        public int TotalLessons { get; set; }
        public int TotalDuration { get; set; }
    }
}

