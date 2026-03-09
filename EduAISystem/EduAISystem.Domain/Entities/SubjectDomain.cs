namespace EduAISystem.Domain.Entities
{
    public class SubjectDomain
    {
        public Guid Id { get; private set; }
        public string Code { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public string? NameEn { get; private set; }
        public string? Description { get; private set; }
        public string? IconUrl { get; private set; }
        public string? Color { get; private set; }
        public int SortOrder { get; private set; }
        public bool IsActive { get; private set; }

        protected SubjectDomain() { }

        // Factory khi tạo mới từ use case
        public static SubjectDomain Create(
            string code,
            string name,
            string? nameEn = null,
            string? description = null,
            string? iconUrl = null,
            string? color = null,
            int sortOrder = 0)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Mã môn học không được để trống!", nameof(code));

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên môn học không được để trống!", nameof(name));

            if (sortOrder < 0)
                throw new ArgumentException("SortOrder không được âm", nameof(sortOrder));

            return new SubjectDomain
            {
                Id = Guid.NewGuid(),
                Code = code.Trim(),
                Name = name.Trim(),
                NameEn = nameEn?.Trim(),
                Description = description,
                IconUrl = iconUrl,
                Color = color,
                SortOrder = sortOrder,
                IsActive = true
            };
        }

        // Factory khi mapping từ DB (Repository dùng)
        internal static SubjectDomain Load(
            Guid id,
            string code,
            string name,
            string? nameEn,
            string? description,
            string? iconUrl,
            string? color,
            int sortOrder,
            bool isActive)
        {
            return new SubjectDomain
            {
                Id = id,
                Code = code,
                Name = name,
                NameEn = nameEn,
                Description = description,
                IconUrl = iconUrl,
                Color = color,
                SortOrder = sortOrder,
                IsActive = isActive
            };
        }

        public void Update(
            string name,
            string? nameEn,
            string? description,
            string? iconUrl,
            string? color,
            int sortOrder)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên môn học không được để trống!", nameof(name));

            if (sortOrder < 0)
                throw new ArgumentException("SortOrder không được âm", nameof(sortOrder));

            Name = name.Trim();
            NameEn = nameEn?.Trim();
            Description = description;
            IconUrl = iconUrl;
            Color = color;
            SortOrder = sortOrder;
        }

        public void Activate() => IsActive = true;

        public void Deactivate() => IsActive = false;
    }
}
