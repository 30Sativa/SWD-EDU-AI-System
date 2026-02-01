namespace EduAISystem.Application.Features.Users.DTOs.Response
{
    public class UserDetailResponseDto
    {
        public Guid Id { get; init; }
        public string Email { get; init; } = string.Empty;
        public string? UserName { get; init; }
        public int Role { get; init; }
        public bool IsActive { get; init; }
        public DateTime? CreatedAt { get; init; }

        // Profile (null nếu user chưa có profile)
        public UserProfileDetailDto? Profile { get; init; }
    }

    public class UserProfileDetailDto
    {
        public string FullName { get; init; } = string.Empty;
        public string? AvatarUrl { get; init; }
        public string? PhoneNumber { get; init; }
        public DateOnly? DateOfBirth { get; init; }
        public string? Gender { get; init; }
        public string? Address { get; init; }
        public string? Bio { get; init; }
    }
}
