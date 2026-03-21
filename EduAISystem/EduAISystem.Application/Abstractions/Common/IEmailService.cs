using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Common
{
    public interface IEmailService
    {
        /// <summary>Gửi email chào mừng kèm password tạm (dùng khi admin tạo user)</summary>
        Task SendWelcomeEmail(string email, string password);

        /// <summary>
        /// Gửi email xác nhận đăng ký (Register).
        /// Link dạng: {frontendUrl}/verify-email?token={token}
        /// </summary>
        Task SendVerifyEmailAsync(string toEmail, string fullName, string verifyLink);

        /// <summary>
        /// Gửi email reset mật khẩu (Forgot Password).
        /// Link dạng: {frontendUrl}/reset-password?token={token}
        /// </summary>
        Task SendForgotPasswordEmailAsync(string toEmail, string fullName, string resetLink);
        
        /// <summary>Gửi email thông báo học sinh đã được thêm vào lớp học</summary>
        Task SendClassEnrollmentEmailAsync(string toEmail, string fullName, string className);
    }
}
