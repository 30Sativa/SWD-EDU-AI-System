namespace EduAISystem.Domain.Entities
{
    public class ClassDomain
    {
        public Guid Id { get; private set; }
        public string Code { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public Guid? TeacherId { get; private set; }
        public Guid? TermId { get; private set; }
        public Guid? GradeLevelId { get; private set; }
        public int MaxStudents { get; private set; }
        public int CurrentStudents { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        protected ClassDomain() { }

        public static ClassDomain Create(
            string code,
            string name,
            string? description,
            Guid? teacherId,
            Guid? termId,
            Guid? gradeLevelId,
            int maxStudents = 50)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Mã lớp không được để trống!", nameof(code));
            if (code.Trim().Length > 20)
                throw new ArgumentException("Mã lớp không được vượt quá 20 ký tự.", nameof(code));

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên lớp không được để trống!", nameof(name));
            if (name.Trim().Length > 100)
                throw new ArgumentException("Tên lớp không được vượt quá 100 ký tự.", nameof(name));

            if (description != null && description.Length > 500)
                throw new ArgumentException("Mô tả lớp không được vượt quá 500 ký tự.", nameof(description));

            if (maxStudents <= 0)
                throw new ArgumentException("Số học sinh tối đa phải lớn hơn 0.", nameof(maxStudents));

            return new ClassDomain
            {
                Id = Guid.NewGuid(),
                Code = code.Trim(),
                Name = name.Trim(),
                Description = description?.Trim(),
                TeacherId = teacherId,
                TermId = termId,
                GradeLevelId = gradeLevelId,
                MaxStudents = maxStudents,
                CurrentStudents = 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };
        }

        internal static ClassDomain Load(
            Guid id,
            string code,
            string name,
            string? description,
            Guid? teacherId,
            Guid? termId,
            Guid? gradeLevelId,
            int maxStudents,
            int currentStudents,
            bool isActive,
            DateTime createdAt,
            DateTime? updatedAt)
        {
            return new ClassDomain
            {
                Id = id,
                Code = code,
                Name = name,
                Description = description,
                TeacherId = teacherId,
                TermId = termId,
                GradeLevelId = gradeLevelId,
                MaxStudents = maxStudents,
                CurrentStudents = currentStudents,
                IsActive = isActive,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            };
        }

        public void Update(
            string name,
            string? description,
            Guid? teacherId,
            Guid? termId,
            Guid? gradeLevelId,
            int maxStudents)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên lớp không được để trống!", nameof(name));
            if (name.Trim().Length > 100)
                throw new ArgumentException("Tên lớp không được vượt quá 100 ký tự.", nameof(name));

            if (description != null && description.Length > 500)
                throw new ArgumentException("Mô tả lớp không được vượt quá 500 ký tự.", nameof(description));

            if (maxStudents <= 0)
                throw new ArgumentException("Số học sinh tối đa phải lớn hơn 0.", nameof(maxStudents));
            if (CurrentStudents > maxStudents)
                throw new ArgumentException("Số học sinh hiện tại không được vượt quá số học sinh tối đa.", nameof(maxStudents));

            Name = name.Trim();
            Description = description?.Trim();
            TeacherId = teacherId;
            TermId = termId;
            GradeLevelId = gradeLevelId;
            MaxStudents = maxStudents;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate()
        {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}

