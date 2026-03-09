namespace EduAISystem.Application.Features.Auth.DTOs.Request
{
    public class VerifyEmailRequestDto
    {
        /// <summary>Token nhận được trong link email verify</summary>
        public string Token { get; set; } = string.Empty;
    }
}
