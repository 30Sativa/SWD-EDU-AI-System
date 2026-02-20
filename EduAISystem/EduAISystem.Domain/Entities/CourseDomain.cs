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
        public Guid? GradeLevelId { get; private set; }
        public Guid? CategoryId { get; private set; }

        public Guid? TeacherId { get; private set; }
        public Guid? SourceTemplateId { get; private set; }

        public CourseLevelDomain Level { get; private set; }
        public string Language { get; private set; } = "vi-VN";

        public int TotalLessons { get; private set; }
        public int TotalDuration { get; private set; }

        public CourseStatusDomain Status { get; private set; }
        public bool IsActive { get; private set; }
        public bool IsTemplate { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public DateTime? DeletedAt { get; private set; }

        public ICollection<SectionDomain> Sections { get; private set; } = new List<SectionDomain>();

        protected CourseDomain() { }

        private CourseDomain(
            string code,
            string title,
            Guid subjectId,
            CourseLevelDomain level,
            bool isTemplate,
            Guid? teacherId = null,
            Guid? sourceTemplateId = null,
            Guid? gradeLevelId = null,
            Guid? categoryId = null,
            string? description = null,
            string? thumbnail = null)
        {
            ValidateCodeAndTitle(code, title);

            Id = Guid.NewGuid();
            Code = code.Trim();
            Title = title.Trim();
            Slug = GenerateSlug(title);

            SubjectId = subjectId;
            GradeLevelId = gradeLevelId;
            CategoryId = categoryId;

            Description = description;
            Thumbnail = thumbnail;

            Level = level;

            IsTemplate = isTemplate;
            TeacherId = teacherId;
            SourceTemplateId = sourceTemplateId;

            Status = CourseStatusDomain.Draft;
            IsActive = true;

            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        // =========================
        // CREATE TEMPLATE
        // =========================
        public static CourseDomain CreateTemplate(
            string code,
            string title,
            Guid subjectId,
            CourseLevelDomain level,
            Guid? gradeLevelId = null,
            Guid? categoryId = null,
            string? description = null,
            string? thumbnail = null)
        {
            return new CourseDomain(
                code,
                title,
                subjectId,
                level,
                isTemplate: true,
                gradeLevelId: gradeLevelId,
                categoryId: categoryId,
                description: description,
                thumbnail: thumbnail);
        }

        // =========================
        // CLONE FROM TEMPLATE
        // =========================
        public static CourseDomain CloneFromTemplate(
            CourseDomain template,
            Guid teacherId,
            string newCode)
        {
            if (!template.IsTemplate)
                throw new InvalidOperationException("Source must be template.");

            if (teacherId == Guid.Empty)
                throw new ArgumentException("TeacherId required.");

            return new CourseDomain(
                newCode,
                template.Title,
                template.SubjectId,
                template.Level,
                isTemplate: false,
                teacherId: teacherId,
                sourceTemplateId: template.Id,
                gradeLevelId: template.GradeLevelId,
                categoryId: template.CategoryId,
                description: template.Description,
                thumbnail: template.Thumbnail);
        }

        // =========================
        // UPDATE BASIC INFO
        // =========================
        public void UpdateBasicInfo(
            string title,
            string? description,
            string? thumbnail,
            CourseLevelDomain level,
            string? language)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title cannot be empty.");

            Title = title.Trim();
            Slug = GenerateSlug(title);

            Description = description;
            Thumbnail = thumbnail;
            Level = level;

            if (!string.IsNullOrWhiteSpace(language))
                Language = language;

            UpdatedAt = DateTime.UtcNow;
        }

        // =========================
        // PUBLISH
        // =========================
        public void Publish()
        {
            if (IsTemplate)
                throw new InvalidOperationException("Template cannot publish.");

            if (Status == CourseStatusDomain.Archived)
                throw new InvalidOperationException("Archived cannot publish.");

            if (!IsReadyForPublish())
                throw new InvalidOperationException("Course not ready.");

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

        public void SoftDelete()
        {
            if (Status != CourseStatusDomain.Draft)
                throw new InvalidOperationException("Only draft can delete.");

            DeletedAt = DateTime.UtcNow;
        }

        public void SetTotals(int totalLessons, int totalDuration)
        {
            if (totalLessons < 0 || totalDuration < 0)
                throw new ArgumentException("Totals cannot be negative.");

            TotalLessons = totalLessons;
            TotalDuration = totalDuration;
            UpdatedAt = DateTime.UtcNow;
        }

        public void AddSection(SectionDomain section)
        {
            if (section == null)
                throw new ArgumentNullException(nameof(section));

            if (section.CourseId != Id)
                throw new InvalidOperationException("Section CourseId mismatch.");

            Sections.Add(section);
            UpdatedAt = DateTime.UtcNow;
        }

        private static void ValidateCodeAndTitle(string code, string title)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Code required.");

            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title required.");
        }

        private static string GenerateSlug(string title)
        {
            var slug = title.Trim().ToLowerInvariant();
            slug = string.Join("-", slug.Split(' ', StringSplitOptions.RemoveEmptyEntries));
            return slug.Length > 200 ? slug[..200] : slug;
        }

        private bool IsReadyForPublish()
        {
            return !string.IsNullOrWhiteSpace(Title)
                   && !string.IsNullOrWhiteSpace(Description)
                   && !string.IsNullOrWhiteSpace(Thumbnail);
        }
    }
}