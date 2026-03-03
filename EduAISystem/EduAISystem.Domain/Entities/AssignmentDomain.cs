using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    /// <summary>
    /// Domain model cho bài tập (Assignment) gắn với Course.
    /// </summary>
    public class AssignmentDomain
    {
        public Guid Id { get; private set; }

        public Guid CourseId { get; private set; }

        public string Title { get; private set; } = null!;

        public string? Description { get; private set; }

        public DateTime? DueDate { get; private set; }

        public decimal? MaxScore { get; private set; }

        /// <summary>
        /// Draft = chưa publish, Published = học sinh nhìn thấy và có thể nộp.
        /// </summary>
        public AssignmentStatusDomain Status { get; private set; }

        public DateTime? CreatedAt { get; private set; }

        public DateTime? UpdatedAt { get; private set; }

        protected AssignmentDomain() { }

        internal AssignmentDomain(
            Guid id,
            Guid courseId,
            string title,
            string? description,
            DateTime? dueDate,
            decimal? maxScore,
            AssignmentStatusDomain status,
            DateTime? createdAt,
            DateTime? updatedAt)
        {
            Id = id;
            CourseId = courseId;
            Title = title;
            Description = description;
            DueDate = dueDate;
            MaxScore = maxScore;
            Status = status;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
        }

        public static AssignmentDomain Create(
            Guid courseId,
            string title,
            string? description,
            DateTime? dueDate,
            decimal? maxScore,
            bool publish = false)
        {
            if (courseId == Guid.Empty)
                throw new ArgumentException("CourseId là bắt buộc.");

            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Tiêu đề bài tập không được để trống.");

            return new AssignmentDomain
            {
                Id = Guid.NewGuid(),
                CourseId = courseId,
                Title = title.Trim(),
                Description = description,
                DueDate = dueDate,
                MaxScore = maxScore,
                Status = publish ? AssignmentStatusDomain.Published : AssignmentStatusDomain.Draft,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };
        }

        public void Update(
            string? title,
            string? description,
            DateTime? dueDate,
            decimal? maxScore)
        {
            if (!string.IsNullOrWhiteSpace(title))
            {
                Title = title.Trim();
            }

            if (description is not null)
            {
                Description = description;
            }

            if (dueDate.HasValue)
            {
                DueDate = dueDate;
            }

            if (maxScore.HasValue)
            {
                MaxScore = maxScore;
            }

            UpdatedAt = DateTime.UtcNow;
        }

        public void Publish()
        {
            Status = AssignmentStatusDomain.Published;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Unpublish()
        {
            Status = AssignmentStatusDomain.Draft;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}

