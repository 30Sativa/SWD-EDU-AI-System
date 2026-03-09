namespace EduAISystem.Infrastructure.Persistence.Entities;

/// <summary>
/// Bảng lưu token xác nhận email khi đăng ký.
/// Tương tự PasswordResets nhưng dành cho email verification.
/// Cần chạy SQL để tạo bảng này trong database:
/// 
/// CREATE TABLE EmailVerificationTokens (
///     Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
///     UserId UNIQUEIDENTIFIER NOT NULL,
///     Token NVARCHAR(64) NOT NULL,
///     ExpiresAt DATETIME2 NOT NULL,
///     IsUsed BIT NOT NULL DEFAULT 0,
///     UsedAt DATETIME2 NULL,
///     CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
///     CONSTRAINT FK_EmailVerificationTokens_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
///     CONSTRAINT UQ_EmailVerificationTokens_Token UNIQUE (Token),
///     INDEX IX_EmailVerificationTokens_Token (Token) WHERE IsUsed = 0
/// );
/// </summary>
public class EmailVerificationToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
