namespace EduAISystem.Application.Features.Users.DTOs.Response
{
    public class UserListResponseDto
    {
        public Guid Id { get; init; }
        public string Email { get; init; } = string.Empty;

        // FullName bên bảng UserProfile, sẽ null nếu user chưa có profile
        public string? FullName { get; init; }
        
        public int Role { get; init; }
        public bool IsActive { get; init; }
        public DateTime? CreatedAt { get; init; }
        
        // Status for admin
        public bool IsDeleted { get; init; }
        public DateTime? DeletedAt { get; init; }
    }
}
