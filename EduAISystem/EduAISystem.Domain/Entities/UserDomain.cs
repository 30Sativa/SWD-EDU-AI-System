using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    public class UserDomain
    {
        public Guid Id { get; private set; }

        public string Email { get; private set; } = string.Empty; 
        public string PasswordHash { get; private set; } = string.Empty;

        public bool IsActive { get; private set; }
        public UserRoleDomain Role { get; private set; }
        public bool IsFirstLogin { get; private set; }
        public bool IsEmailVerified { get; private set; }
        public string? GoogleId { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime? DeletedAt { get; private set; }

        public virtual UserProfileDomain? UserProfile { get; internal set; }

        public bool IsDeleted => DeletedAt.HasValue;


        protected UserDomain() { } // EF

        //bussiness constructor
        public UserDomain(string email, string passwordHash, UserProfileDomain userProfile,UserRoleDomain role)
        {
            Id = Guid.NewGuid();
            Email = email;
            PasswordHash = passwordHash;
            Role = role;
            UserProfile = userProfile;
            IsActive = true;
            CreatedAt = DateTime.UtcNow;
        }

        //mapping constructor
        internal UserDomain(
            Guid id,
            string email,
            string passwordHash,
            bool isActive,
            bool isEmailVerified,
            string? googleId,
            UserRoleDomain role,
            DateTime createdAt,
            DateTime? deletedAt = null)
        {
            Id = id;
            Email = email;
            PasswordHash = passwordHash;
            IsActive = isActive;
            IsEmailVerified = isEmailVerified;
            GoogleId = googleId;
            Role = role;
            CreatedAt = createdAt;
            DeletedAt = deletedAt;
        }
        // Factory method to create a new UserDomain (self-register → cần verify email)
        public static UserDomain Create(
            string email,
            string passwordHash,
            string fullName,
            UserRoleDomain role)
        {
            var userId = Guid.NewGuid();
            var profile = new UserProfileDomain(userId, fullName);
            return new UserDomain
            {
                Id = userId,
                Email = email,
                PasswordHash = passwordHash,
                UserProfile = profile,
                Role = role,
                IsActive = true,
                IsEmailVerified = false, // phải verify email trước khi login
                CreatedAt = DateTime.UtcNow
            };
        }

        // Factory method: tạo user từ Google OAuth (email đã trusted, không cần verify)
        public static UserDomain CreateViaGoogle(
            string email,
            string googleId,
            string fullName,
            string? avatarUrl,
            string passwordHash,
            UserRoleDomain role)
        {
            var userId = Guid.NewGuid();
            var profile = new UserProfileDomain(userId, fullName, avatarUrl);
            return new UserDomain
            {
                Id = userId,
                Email = email,
                PasswordHash = passwordHash, // Generate later when registering Google via handler
                GoogleId = googleId,
                UserProfile = profile,
                Role = role,
                IsActive = true,
                IsEmailVerified = true, // Google đã verify rồi
                CreatedAt = DateTime.UtcNow
            };
        }

        public void LinkGoogleAccount(string googleId)
        {
            GoogleId = googleId;
            IsEmailVerified = true; // link Google → coi như verified
        }
        // Factory method to create an imported UserDomain
        public static UserDomain CreateImported(string email, string passwordHash, string fullName, UserRoleDomain role)
        {
            var userId = Guid.NewGuid();
            var profile = new UserProfileDomain(userId, fullName);
            return new UserDomain
            {
                Id = userId,
                Email = email,
                PasswordHash = passwordHash,
                UserProfile = profile,
                Role = role,
                IsActive = true,
                IsFirstLogin = true,
                IsEmailVerified = false,
                CreatedAt = DateTime.UtcNow
            };
        }

        public void UpdateProfile(
            string? fullName,
            string? avatarUrl,
            string? phoneNumber,
            DateOnly? dob,
            string? gender,
            string? address,
            string? bio) {
            if (UserProfile == null)
                throw new Exception("Profile missing");

            UserProfile.UpdateAllInfo(
                fullName,
                avatarUrl,
                phoneNumber,
                dob,
                gender,
                address,
                bio);

        }

        /// <summary>
        /// User có thể login nếu: đang active VÀ email đã được verify
        /// (Google user luôn verified; user tự đăng ký cần xác nhận qua email)
        /// </summary>
        public bool CanLogin() => IsActive && IsEmailVerified;

 
        public void ChangePassword(string newHash)
        {
            PasswordHash = newHash;
            IsFirstLogin = false;
        }
        public void VerifyEmail()
        {
            IsEmailVerified = true;
        }
        public void Deactivate()
        {
            IsActive = false;
        }

        public void Activate()
        {
            IsActive = true;
        }

        public void ChangeRole(UserRoleDomain role)
        {
            Role = role;
        }

        // =========================
        // SOFT DELETE
        // =========================
        public void SoftDelete()
        {
            if (DeletedAt.HasValue)
                return; // Already deleted

            DeletedAt = DateTime.UtcNow;
            IsActive = false; // Deactivate when soft deleted
        }

        // =========================
        // RESTORE
        // =========================
        public void Restore()
        {
            if (!DeletedAt.HasValue)
                return; // Not deleted

            DeletedAt = null;
            IsActive = true; // Reactivate when restored
        }
    }
}
