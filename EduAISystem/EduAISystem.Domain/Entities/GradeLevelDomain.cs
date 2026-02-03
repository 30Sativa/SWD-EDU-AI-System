namespace EduAISystem.Domain.Entities
{
    public class GradeLevelDomain
    {
        public Guid Id { get; private set; }
        public string Code { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public int SortOrder { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        protected GradeLevelDomain() { }

        public static GradeLevelDomain Create(string code, string name, int sortOrder = 0)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Mã khối/lớp không được để trống!", nameof(code));

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên khối/lớp không được để trống!", nameof(name));

            if (sortOrder < 0)
                throw new ArgumentException("SortOrder không được âm", nameof(sortOrder));

            return new GradeLevelDomain
            {
                Id = Guid.NewGuid(),
                Code = code.Trim(),
                Name = name.Trim(),
                SortOrder = sortOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
        }

        internal static GradeLevelDomain Load(
            Guid id,
            string code,
            string name,
            int sortOrder,
            bool isActive,
            DateTime createdAt)
        {
            return new GradeLevelDomain
            {
                Id = id,
                Code = code,
                Name = name,
                SortOrder = sortOrder,
                IsActive = isActive,
                CreatedAt = createdAt
            };
        }

        public void Update(string name, int sortOrder)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên khối/lớp không được để trống!", nameof(name));

            if (sortOrder < 0)
                throw new ArgumentException("SortOrder không được âm", nameof(sortOrder));

            Name = name.Trim();
            SortOrder = sortOrder;
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;
    }
}

