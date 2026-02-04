using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    public class CourseDomain
    {
        public Guid Id { get; private set; }
        public string Code { get; private set; } = string.Empty;
        public string Title { get; private set; } = string.Empty;
        public string Slug { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public string? Thumbnail { get; private set; }

        public Guid SubjectId { get; private set; }
        public string SubjectName { get; private set; } = string.Empty;

        public Guid? GradeLevelId { get; private set; }
        public Guid TeacherId { get; private set; }
        public Guid? CategoryId { get; private set; }

        public string? Level { get; private set; }
        public string? Language { get; private set; }
        public decimal Price { get; private set; }
        public decimal? DiscountPrice { get; private set; }
        public int TotalLessons { get; private set; }
        public int TotalDuration { get; private set; }
        public int EnrollmentCount { get; private set; }
        public decimal Rating { get; private set; }
        public int ReviewCount { get; private set; }

        public CourseStatusDomain Status { get; private set; }
        public bool IsActive { get; private set; }
        public bool IsFeatured { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public DateTime? DeletedAt { get; private set; }

        protected CourseDomain()
        {
        }

        public static CourseDomain Create(
            string code,
            string title,
            Guid subjectId,
            Guid teacherId,
            string? description = null,
            string? thumbnail = null,
            Guid? gradeLevelId = null,
            Guid? categoryId = null,
            string? level = null,
            string? language = "vi-VN",
            decimal price = 0,
            decimal? discountPrice = null,
            int totalLessons = 0,
            int totalDuration = 0)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Mã khóa học không được để trống!", nameof(code));

            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Tiêu đề khóa học không được để trống!", nameof(title));

            var now = DateTime.UtcNow;

            return new CourseDomain
            {
                Id = Guid.NewGuid(),
                Code = code.Trim(),
                Title = title.Trim(),
                Slug = GenerateSlug(title),
                Description = description,
                Thumbnail = thumbnail,
                SubjectId = subjectId,
                SubjectName = string.Empty,
                GradeLevelId = gradeLevelId,
                TeacherId = teacherId,
                CategoryId = categoryId,
                Level = level,
                Language = language,
                Price = price,
                DiscountPrice = discountPrice,
                TotalLessons = totalLessons,
                TotalDuration = totalDuration,
                EnrollmentCount = 0,
                Rating = 0,
                ReviewCount = 0,
                Status = CourseStatusDomain.Draft,
                IsActive = true,
                IsFeatured = false,
                CreatedAt = now,
                UpdatedAt = now
            };
        }

        internal static CourseDomain Load(
            Guid id,
            string code,
            string title,
            string slug,
            string? description,
            string? thumbnail,
            Guid subjectId,
            string subjectName,
            Guid? gradeLevelId,
            Guid teacherId,
            Guid? categoryId,
            string? level,
            string? language,
            decimal price,
            decimal? discountPrice,
            int totalLessons,
            int totalDuration,
            int enrollmentCount,
            decimal rating,
            int reviewCount,
            CourseStatusDomain status,
            bool isActive,
            bool isFeatured,
            DateTime createdAt,
            DateTime? updatedAt,
            DateTime? deletedAt)
        {
            return new CourseDomain
            {
                Id = id,
                Code = code,
                Title = title,
                Slug = slug,
                Description = description,
                Thumbnail = thumbnail,
                SubjectId = subjectId,
                SubjectName = subjectName,
                GradeLevelId = gradeLevelId,
                TeacherId = teacherId,
                CategoryId = categoryId,
                Level = level,
                Language = language,
                Price = price,
                DiscountPrice = discountPrice,
                TotalLessons = totalLessons,
                TotalDuration = totalDuration,
                EnrollmentCount = enrollmentCount,
                Rating = rating,
                ReviewCount = reviewCount,
                Status = status,
                IsActive = isActive,
                IsFeatured = isFeatured,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt,
                DeletedAt = deletedAt
            };
        }

        public void Publish()
        {
            if (Status == CourseStatusDomain.Archived)
                throw new InvalidOperationException("Không thể publish khóa học đã bị lưu trữ (archived).");

            if (!IsReadyForPublish())
                throw new InvalidOperationException("Khóa học chưa đủ thông tin tối thiểu để publish.");

            Status = CourseStatusDomain.Published;
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Archive()
        {
            Status = CourseStatusDomain.Archived;
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }

        public bool IsReadyForPublish()
        {
            // Điều kiện tối thiểu để publish:
            // - Có tiêu đề
            // - Có mô tả
            // - Có ảnh thumbnail
            // (có thể mở rộng thêm các rule khác sau này)
            return !string.IsNullOrWhiteSpace(Title)
                   && !string.IsNullOrWhiteSpace(Description)
                   && !string.IsNullOrWhiteSpace(Thumbnail);
        }

        public void SoftDelete()
        {
            if (Status != CourseStatusDomain.Draft)
                throw new InvalidOperationException("Chỉ có thể xóa mềm khóa học ở trạng thái Draft.");

            DeletedAt = DateTime.UtcNow;
        }

        public void UpdateBasicInfo(
            string title,
            string? description,
            string? thumbnail,
            string? level,
            string? language,
            decimal price,
            decimal? discountPrice)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Tiêu đề khóa học không được để trống!", nameof(title));

            Title = title.Trim();
            Slug = GenerateSlug(title);
            Description = description;
            Thumbnail = thumbnail;
            Level = level;
            Language = language;
            Price = price;
            DiscountPrice = discountPrice;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetSubject(string subjectName)
        {
            SubjectName = subjectName;
        }

        private static string GenerateSlug(string title)
        {
            var slug = title.Trim().ToLowerInvariant();
            slug = string.Join("-", slug.Split(' ', StringSplitOptions.RemoveEmptyEntries));
            return slug.Length > 200 ? slug[..200] : slug;
        }
    }
}
