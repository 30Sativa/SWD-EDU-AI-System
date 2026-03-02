namespace EduAISystem.Application.Features.Users.DTOs.Request
{
    public class UpdateUserProfileRequestDto
    {
        public string? FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
    }
}
