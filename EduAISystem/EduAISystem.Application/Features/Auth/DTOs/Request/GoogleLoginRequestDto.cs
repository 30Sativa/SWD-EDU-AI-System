namespace EduAISystem.Application.Features.Auth.DTOs.Request
{
    /// <summary>
    /// Nhận id_token từ Google Sign-In trên frontend.
    /// Frontend dùng Google SDK → lấy id_token → gửi về đây.
    /// </summary>
    public class GoogleLoginRequestDto
    {
        /// <summary>JWT id_token từ Google OAuth2</summary>
        public string IdToken { get; set; } = string.Empty;

        /// <summary>Role muốn đăng ký nếu là user mới (0=Student, 1=Teacher, ...)</summary>
        public int? DefaultRole { get; set; }
    }
}
