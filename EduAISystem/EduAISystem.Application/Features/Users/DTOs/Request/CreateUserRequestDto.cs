namespace EduAISystem.Application.Features.Users.DTOs.Request
{
    public class CreateUserRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public int Role { get; set; }
    }
}
