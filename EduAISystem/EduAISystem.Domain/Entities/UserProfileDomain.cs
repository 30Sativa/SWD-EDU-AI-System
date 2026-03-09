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
            string? fullName,
            string? avatarUrl = null,
            string? phoneNumber = null,
            DateOnly? dateOfBirth = null,
            string? gender = null,
            string? address = null,
            string? bio = null)
        {
            if (string.IsNullOrWhiteSpace(fullName))
                throw new ArgumentException("Họ tên không được để trống", nameof(fullName));

            //// Validate Gender nếu có
            //if (gender != null && !IsValidGender(gender))
            //    throw new ArgumentException("Giới tính không hợp lệ", nameof(gender));

            if (fullName != null)
                FullName = fullName;

            if (avatarUrl != null)
                AvatarUrl = avatarUrl;

            if (phoneNumber != null)
                PhoneNumber = phoneNumber;
            
            if (dateOfBirth.HasValue)
                DateOfBirth = dateOfBirth.Value;

            if (gender != null)
                Gender = gender;

            if (address != null)
                Address = address;

            if (bio != null)
                Bio = bio;
        }

        // Constructor đơn giản chỉ với required fields (dùng cho tạo mới, còn Load dùng cho mapping từ DB)
        public UserProfileDomain(Guid userId, string fullName)
        {
            UserId = userId;
            FullName = fullName;
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

        public void UpdateAllInfo(
            string? fullName = null,
            string? avatarUrl = null,
            string? phoneNumber = null,
            DateOnly? dateOfBirth = null,
            string? gender = null,
            string? address = null,
            string? bio = null)
        {
            // null hoặc "" (chuỗi rỗng) đều bị bỏ qua → giữ nguyên giá trị cũ
            if (!string.IsNullOrWhiteSpace(fullName))
                FullName = fullName;

            if (!string.IsNullOrWhiteSpace(avatarUrl))
                AvatarUrl = avatarUrl;

            if (!string.IsNullOrWhiteSpace(phoneNumber))
                PhoneNumber = phoneNumber;

            if (dateOfBirth.HasValue)
                DateOfBirth = dateOfBirth.Value;

            if (!string.IsNullOrWhiteSpace(gender))
                Gender = gender;

            if (!string.IsNullOrWhiteSpace(address))
                Address = address;

            if (!string.IsNullOrWhiteSpace(bio))
                Bio = bio;
        }
        public void UpdateAvatar(string? avatarUrl)
        {
            AvatarUrl = avatarUrl;
        }

        // Helper
        private static bool IsValidGender(string gender) =>
            gender.Equals("Nam", StringComparison.OrdinalIgnoreCase) ||
            gender.Equals("Nữ", StringComparison.OrdinalIgnoreCase) ||
            gender.Equals("Khác", StringComparison.OrdinalIgnoreCase);
    }
}

