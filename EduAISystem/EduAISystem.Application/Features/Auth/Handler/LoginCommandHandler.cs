using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Auth.Commands;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;
using System;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Auth.Handler
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
    {
        private readonly IUserRepository _users;
        private readonly ILoginSessionRepository _sessions;
        private readonly IRefreshTokenRepository _refreshTokens;
        private readonly ILoginAttemptRepository _loginAttempts;
        private readonly IPasswordHasher _hasher;
        private readonly IJwtTokenGenerator _jwt;
        private readonly IClientContext _client;

        public LoginCommandHandler(
            IUserRepository users,
            ILoginSessionRepository sessions,
            IRefreshTokenRepository refreshTokens,
            ILoginAttemptRepository loginAttempts,
            IPasswordHasher hasher,
            IJwtTokenGenerator jwt,
            IClientContext client)
        {
            _users = users;
            _sessions = sessions;
            _refreshTokens = refreshTokens;
            _loginAttempts = loginAttempts;
            _hasher = hasher;
            _jwt = jwt;
            _client = client;
        }

        public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var email = request.Request.Email;

            // Check if account is temporarily locked due to too many failed attempts
            var maxAttempts = 5;
            var lockoutTime = TimeSpan.FromMinutes(15);
            var recentFailedAttempts = await _loginAttempts.CountRecentFailedAttemptsAsync(email, lockoutTime);
            
            if (recentFailedAttempts >= maxAttempts)
            {
                throw new ForbiddenException("Quá nhiều lần thử sai. Vui lòng thử lại sau 15 phút.");
            }

            var user = await _users.GetByEmailAsync(email);
            if (user == null)
            {
                await _loginAttempts.AddAsync(new LoginAttemptDomain(email, null, _client.IpAddress, false, "User not found"));
                throw new NotFoundException("User not found.");
            }

            if (!user.CanLogin())
            {
                await _loginAttempts.AddAsync(new LoginAttemptDomain(email, user.Id, _client.IpAddress, false, "User is inactive"));
                throw new ForbiddenException("User is inactive.");
            }

            if (!_hasher.Verify(request.Request.Password, user.PasswordHash))
            {
                await _loginAttempts.AddAsync(new LoginAttemptDomain(email, user.Id, _client.IpAddress, false, "Invalid credentials"));
                throw new ForbiddenException("Invalid credentials");
            }

            // Authentication successful -> clear failed attempts and record success
            await _loginAttempts.ClearFailedAttemptsAsync(email);
            await _loginAttempts.AddAsync(new LoginAttemptDomain(email, user.Id, _client.IpAddress, true, null));

            // Create session
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
