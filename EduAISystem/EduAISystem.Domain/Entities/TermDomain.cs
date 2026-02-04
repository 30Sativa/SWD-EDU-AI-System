namespace EduAISystem.Domain.Entities
{
    public class TermDomain
    {
        public Guid Id { get; private set; }
        public string Code { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public DateOnly StartDate { get; private set; }
        public DateOnly EndDate { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        protected TermDomain() { }

        public static TermDomain Create(string code, string name, DateOnly startDate, DateOnly endDate)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Mã kỳ học không được để trống!", nameof(code));
            if (code.Trim().Length > 20)
                throw new ArgumentException("Mã kỳ học không được vượt quá 20 ký tự.", nameof(code));

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên kỳ học không được để trống!", nameof(name));
            if (name.Trim().Length > 100)
                throw new ArgumentException("Tên kỳ học không được vượt quá 100 ký tự.", nameof(name));

            if (endDate <= startDate)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn ngày bắt đầu.");

            return new TermDomain
            {
                Id = Guid.NewGuid(),
                Code = code.Trim(),
                Name = name.Trim(),
                StartDate = startDate,
                EndDate = endDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
        }

        internal static TermDomain Load(
            Guid id,
            string code,
            string name,
            DateOnly startDate,
            DateOnly endDate,
            bool isActive,
            DateTime createdAt)
        {
            return new TermDomain
            {
                Id = id,
                Code = code,
                Name = name,
                StartDate = startDate,
                EndDate = endDate,
                IsActive = isActive,
                CreatedAt = createdAt
            };
        }

        public void Update(string name, DateOnly startDate, DateOnly endDate)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên kỳ học không được để trống!", nameof(name));
            if (name.Trim().Length > 100)
                throw new ArgumentException("Tên kỳ học không được vượt quá 100 ký tự.", nameof(name));

            if (endDate <= startDate)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn ngày bắt đầu.");

            Name = name.Trim();
            StartDate = startDate;
            EndDate = endDate;
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;
    }
}

