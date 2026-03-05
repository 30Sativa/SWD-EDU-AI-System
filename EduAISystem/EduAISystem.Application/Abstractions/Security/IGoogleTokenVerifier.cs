namespace EduAISystem.Application.Abstractions.Security
{
    /// <summary>
    /// Kết quả sau khi verify id_token của Google.
    /// Các thông tin này đã được Google xác nhận là chính xác.
    /// </summary>
    public class GoogleTokenPayload
    {
        public string GoogleId { get; set; } = string.Empty;   // sub
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;   // name
        public string? AvatarUrl { get; set; }                  // picture
        public bool EmailVerified { get; set; }                  // email_verified
    }

    public interface IGoogleTokenVerifier
    {
        /// <summary>
        /// Verify id_token từ Google Sign-In.
        /// Throws exception nếu token không hợp lệ hoặc đã hết hạn.
        /// </summary>
        Task<GoogleTokenPayload> VerifyAsync(string idToken, CancellationToken cancellationToken = default);
    }
}
