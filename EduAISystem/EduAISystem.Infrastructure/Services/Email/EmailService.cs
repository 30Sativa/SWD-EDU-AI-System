using EduAISystem.Application.Abstractions.Common;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace EduAISystem.Infrastructure.Services.Email
{
    /// <summary>
    /// Email service dùng MailKit + SMTP.
    /// Config trong appsettings.json:
    /// "EmailSettings": {
    ///   "SmtpServer": "smtp.gmail.com",
    ///   "Port": 587,
    ///   "SenderEmail": "your@gmail.com",
    ///   "SenderName": "EduAI System",
    ///   "Username": "your@gmail.com",
    ///   "Password": "app_password_here"
    /// }
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendWelcomeEmail(string email, string password)
        {
            var subject = "Chào mừng đến với EduAI System";
            var body = $@"
                <h2>Chào mừng!</h2>
                <p>Tài khoản của bạn đã được tạo thành công.</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Mật khẩu tạm thời:</strong> {password}</p>
                <p>Vui lòng đăng nhập và đổi mật khẩu ngay.</p>
            ";
            await SendEmailAsync(email, subject, body);
        }

        public async Task SendVerifyEmailAsync(string toEmail, string fullName, string verifyLink)
        {
            var subject = "Xác nhận đăng ký tài khoản EduAI";
            var body = $@"
                <h2>Xin chào {fullName}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản EduAI System.</p>
                <p>Vui lòng click vào link dưới đây để xác nhận email của bạn:</p>
                <p>
                    <a href=""{verifyLink}"" 
                       style=""background:#4F46E5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;"">
                        ✅ Xác nhận Email
                    </a>
                </p>
                <p>Link sẽ hết hạn sau <strong>24 giờ</strong>.</p>
                <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
                <hr/>
                <small>EduAI System</small>
            ";
            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendForgotPasswordEmailAsync(string toEmail, string fullName, string resetLink)
        {
            var subject = "Đặt lại mật khẩu EduAI";
            var body = $@"
                <h2>Xin chào {fullName}!</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Click vào link dưới đây để đặt lại mật khẩu:</p>
                <p>
                    <a href=""{resetLink}"" 
                       style=""background:#DC2626;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;"">
                        🔑 Đặt lại mật khẩu
                    </a>
                </p>
                <p>Link sẽ hết hạn sau <strong>30 phút</strong>.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <hr/>
                <small>EduAI System</small>
            ";
            await SendEmailAsync(toEmail, subject, body);
        }

        // =============================================
        // PRIVATE HELPER
        // =============================================
        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var smtpHost = _config["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_config["EmailSettings:Port"] ?? "587");
            var senderEmail = _config["EmailSettings:SenderEmail"] ?? "";
            var senderName = _config["EmailSettings:SenderName"] ?? "EduAI System";
            var username = _config["EmailSettings:Username"] ?? senderEmail;
            var password = _config["EmailSettings:Password"] ?? "";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
