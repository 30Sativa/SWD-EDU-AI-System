using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Auth.Commands;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using MediatR;
using System.Security.Cryptography;

namespace EduAISystem.Application.Features.Auth.Handler
{
    /// <summary>
    /// Xử lý Google Login:
    /// 1. Verify id_token với Google API
    /// 2. Tìm user theo GoogleId hoặc Email
    ///    - Nếu chưa tồn tại → tạo mới (IsEmailVerified = true vì Google đã verify)
    ///    - Nếu đã có nhưng chưa link Google → link GoogleId vào account
    /// 3. Tạo session + JWT
    /// </summary>
    public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, LoginResponseDto>
    {
        private readonly IGoogleTokenVerifier _googleVerifier;
        private readonly IUserRepository _users;
        private readonly ILoginSessionRepository _sessions;
        private readonly IJwtTokenGenerator _jwt;
        private readonly IClientContext _client;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailService _emailService;
        private readonly IRefreshTokenRepository _refreshTokens;
        private readonly ILoginAttemptRepository _loginAttempts;

        public GoogleLoginCommandHandler(
            IGoogleTokenVerifier googleVerifier,
            IUserRepository users,
            ILoginSessionRepository sessions,
            IJwtTokenGenerator jwt,
            IClientContext client,
            IPasswordHasher passwordHasher,
            IEmailService emailService,
            IRefreshTokenRepository refreshTokens,
            ILoginAttemptRepository loginAttempts)
        {
            _googleVerifier = googleVerifier;
            _users = users;
            _sessions = sessions;
            _jwt = jwt;
            _client = client;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
            _refreshTokens = refreshTokens;
            _loginAttempts = loginAttempts;
        }

        public async Task<LoginResponseDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
        {
            // 1. Verify id_token với Google
            var payload = await _googleVerifier.VerifyAsync(request.Request.IdToken, cancellationToken);

            if (!payload.EmailVerified)
                throw new ForbiddenException("Google account email is not verified.");

            // 2. Tìm user theo GoogleId trước, rồi mới theo Email
            var user = await _users.GetByGoogleIdAsync(payload.GoogleId, cancellationToken)
                      ?? await _users.GetByEmailAsync(payload.Email);

            if (user == null)
            {
                // Tạo user mới từ Google
                var defaultRole = request.Request.DefaultRole.HasValue
                    ? (UserRoleDomain)request.Request.DefaultRole.Value
                    : UserRoleDomain.Student;

                // Generate a random password for regular login
                var randomPassword = $"Gg@{Guid.NewGuid().ToString("N").Substring(0, 8)}!";
                var passwordHash = _passwordHasher.Hash(randomPassword);

                user = UserDomain.CreateViaGoogle(
                    payload.Email,
                    payload.GoogleId,
                    payload.FullName,
                    payload.AvatarUrl,
                    passwordHash,
                    defaultRole);

                await _users.AddAsync(user);

                // Send welcome email with the generated password
                try
                {
                    await _emailService.SendWelcomeEmail(payload.Email, randomPassword);
                }
                catch (Exception)
                {
                    // Ignore email sending failures so the login itself still succeeds
                }
            }
            else
            {
                // User đã tồn tại — link Google nếu chưa có
                if (string.IsNullOrEmpty(user.GoogleId))
                {
                    user.LinkGoogleAccount(payload.GoogleId);
                    await _users.UpdateAsync(user);
                }

                if (!user.IsActive)
                {
                    await _loginAttempts.AddAsync(new LoginAttemptDomain(payload.Email, user.Id, _client.IpAddress, false, "Account is inactive via Google"));
                    throw new ForbiddenException("Account is inactive.");
                }
            }

            // Authentication successful via Google
            await _loginAttempts.ClearFailedAttemptsAsync(payload.Email);
            await _loginAttempts.AddAsync(new LoginAttemptDomain(payload.Email, user.Id, _client.IpAddress, true, "Google OAuth"));

            // 3. Tạo session + JWT
            var session = new LoginSessionDomain(
                user.Id,
                _client.DeviceName,
                _client.IpAddress,
                _client.UserAgent);

            await _sessions.AddAsync(session);

            // Generate Refresh Token
            var refreshTokenString = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var refreshTokenDomain = new RefreshTokenDomain(
                user.Id,
                refreshTokenString,
                DateTime.UtcNow.AddDays(7), // Expiry time (7 days)
                DateTime.UtcNow
            );
            await _refreshTokens.AddAsync(refreshTokenDomain);

            return new LoginResponseDto
            {
                SessionId = session.Id,
                AccessToken = _jwt.GenerateToken(user, session.Id),
                RefreshToken = refreshTokenString,
                ExpiredAt = _jwt.GetExpiredAt()
            };
        }
    }
}
