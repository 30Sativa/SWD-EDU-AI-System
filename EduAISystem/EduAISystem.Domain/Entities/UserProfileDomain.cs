namespace EduAISystem.Domain.Entities
{
    public class UserProfileDomain
    {
        public Guid UserId { get; private set; }
        public string FullName { get; private set; } = string.Empty;
        public string? AvatarUrl { get; private set; }
        public string? PhoneNumber { get; private set; }
        public DateOnly? DateOfBirth { get; private set; }
        public string? Gender { get; private set; }
        public string? Address { get; private set; }
        public string? Bio { get; private set; }

        public virtual UserDomain User { get; private set; } = null!;

        protected UserProfileDomain() { }

        // Business constructor
        public UserProfileDomain(
            Guid userId,
            string fullName,
            string? avatarUrl = null,
            string? phoneNumber = null,
            DateOnly? dateOfBirth = null,
            string? gender = null,
            string? address = null,
            string? bio = null)
        {
            if (string.IsNullOrWhiteSpace(fullName))
                throw new ArgumentException("Họ tên không được để trống", nameof(fullName));

            // Validate Gender nếu có
            if (gender != null && !IsValidGender(gender))
                throw new ArgumentException("Giới tính không hợp lệ", nameof(gender));

            UserId = userId;
            FullName = fullName;
            AvatarUrl = avatarUrl;
            PhoneNumber = phoneNumber;
            DateOfBirth = dateOfBirth;
            Gender = gender;
            Address = address;
            Bio = bio;
        }

        // Factory method để tạo từ Repository (mapping từ EF Entity)
        public static UserProfileDomain Load(
            Guid userId,
            string fullName,
            string? avatarUrl,
            string? phoneNumber,
            DateOnly? dateOfBirth,
            string? gender,
            string? address,
            string? bio)
        {
            // Dùng cho mapping từ DB, không validate nghiêm ngặt như constructor
            return new UserProfileDomain
            {
                UserId = userId,
                FullName = fullName,
                AvatarUrl = avatarUrl,
                PhoneNumber = phoneNumber,
                DateOfBirth = dateOfBirth,
                Gender = gender,
                Address = address,
                Bio = bio
            };
        }

        // Business methods để update (vì Domain dùng private set)
        public void UpdateFullName(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName))
                throw new ArgumentException("Họ tên không được để trống");
            FullName = fullName;
        }

        public void UpdateContactInfo(string? phoneNumber, string? address)
        {
            PhoneNumber = phoneNumber;
            Address = address;
        }

        public void UpdateAvatar(string? avatarUrl)
        {
            AvatarUrl = avatarUrl;
        }

        // Helper
        private static bool IsValidGender(string gender) =>
            gender.Equals("Male", StringComparison.OrdinalIgnoreCase) ||
            gender.Equals("Female", StringComparison.OrdinalIgnoreCase) ||
            gender.Equals("Other", StringComparison.OrdinalIgnoreCase);
    }
}

