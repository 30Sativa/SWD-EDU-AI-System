namespace EduAISystem.Domain.Entities
{
    public class CourseCategoryDomain
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string Slug { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public Guid? ParentId { get; private set; }
        public string? ParentName { get; private set; }
        public string? IconUrl { get; private set; }
        public int SortOrder { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public DateTime? DeletedAt { get; private set; }

        protected CourseCategoryDomain() { }

        public static CourseCategoryDomain Create(
            string name,
            string? description = null,
            Guid? parentId = null,
            string? iconUrl = null,
            int sortOrder = 0)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên danh mục khóa học không được để trống!", nameof(name));

            if (sortOrder < 0)
                throw new ArgumentException("SortOrder không được âm", nameof(sortOrder));

            var now = DateTime.UtcNow;
            return new CourseCategoryDomain
            {
                Id = Guid.NewGuid(),
                Name = name.Trim(),
                Slug = GenerateSlug(name),
                Description = description,
                ParentId = parentId,
                ParentName = null,
                IconUrl = iconUrl,
                SortOrder = sortOrder,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };
        }

        internal static CourseCategoryDomain Load(
            Guid id,
            string name,
            string slug,
            string? description,
            Guid? parentId,
            string? parentName,
            string? iconUrl,
            int sortOrder,
            bool isActive,
            DateTime createdAt,
            DateTime? updatedAt,
            DateTime? deletedAt)
        {
            return new CourseCategoryDomain
            {
                Id = id,
                Name = name,
                Slug = slug,
                Description = description,
                ParentId = parentId,
                ParentName = parentName,
                IconUrl = iconUrl,
                SortOrder = sortOrder,
                IsActive = isActive,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt,
                DeletedAt = deletedAt
            };
        }

        public void Update(
            string name,
            string? description,
            Guid? parentId,
            string? iconUrl,
            int sortOrder)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên danh mục khóa học không được để trống!", nameof(name));

            if (sortOrder < 0)
                throw new ArgumentException("SortOrder không được âm", nameof(sortOrder));

            Name = name.Trim();
            Slug = GenerateSlug(name);
            Description = description;
            ParentId = parentId;
            IconUrl = iconUrl;
            SortOrder = sortOrder;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetParentName(string? parentName) => ParentName = parentName;
        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;

        private static string GenerateSlug(string name)
        {
            var slug = name.Trim().ToLowerInvariant();
            slug = string.Join("-", slug.Split(' ', StringSplitOptions.RemoveEmptyEntries));
            return slug.Length > 100 ? slug[..100] : slug;
        }
    }
}

