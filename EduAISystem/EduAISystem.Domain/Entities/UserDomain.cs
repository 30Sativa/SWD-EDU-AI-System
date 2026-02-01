using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    public class UserDomain
    {
        public Guid Id { get; private set; }

        public string Email { get; private set; } = string.Empty;
        public string UserName { get; private set; } = string.Empty;   
        public string PasswordHash { get; private set; } = string.Empty;

        public bool IsActive { get; private set; }
        public UserRoleDomain Role { get; private set; }

        public DateTime CreatedAt { get; private set; }

        public virtual UserProfileDomain? UserProfile { get; private set; }


        protected UserDomain() { } // EF

        //bussiness constructor
        public UserDomain(string email, string passwordHash, UserRoleDomain role)
        {
            Id = Guid.NewGuid();
            Email = email;
            PasswordHash = passwordHash;
            Role = role;

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
        DateTime createdAt)
        {
            Id = id;
            Email = email;
            PasswordHash = passwordHash;
            IsActive = isActive;
            Role = role;
            CreatedAt = createdAt;
        }

        public static UserDomain Create(
            string email,
            string username,
            string passwordHash,
            UserRoleDomain role)
        {
            return new UserDomain
            {
                Email = email,
                UserName = username,
                PasswordHash = passwordHash,
                Role = role,
            };
        }



        public bool CanLogin() => IsActive;

        public void Deactivate()
        {
            IsActive = false;
        }

        public void Activate()
        {
            IsActive = true;
        }

        public void ChangePassword(string newHash)
        {
            PasswordHash = newHash;
        }

        public void ChangeRole(UserRoleDomain role)
        {
            Role = role;
        }
    }
}
