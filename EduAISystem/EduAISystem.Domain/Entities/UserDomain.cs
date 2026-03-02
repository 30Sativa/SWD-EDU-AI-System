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
            UserRoleDomain role,
            DateTime createdAt,
            DateTime? deletedAt = null)
        {
            Id = id;
            Email = email;
            PasswordHash = passwordHash;
            IsActive = isActive;
            Role = role;
            CreatedAt = createdAt;
            DeletedAt = deletedAt;
        }
        // Factory method to create a new UserDomain
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
                CreatedAt = DateTime.UtcNow
            };
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

        public bool CanLogin() => IsActive;

 
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
