namespace EduAISystem.Application.Features.Auth.DTOs.Request
{
    public class ResetPasswordRequestDto
    {
        /// <summary>Token nhận được trong link email</summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>Mật khẩu mới</summary>
        public string NewPassword { get; set; } = string.Empty;

        /// <summary>Nhập lại mật khẩu mới (validate tại Validator)</summary>
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
