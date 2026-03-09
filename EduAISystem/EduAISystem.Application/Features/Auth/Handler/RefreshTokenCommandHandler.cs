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
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, LoginResponseDto>
    {
        private readonly IRefreshTokenRepository _refreshTokens;
        private readonly IUserRepository _users;
        private readonly ILoginSessionRepository _sessions;
        private readonly IJwtTokenGenerator _jwt;
        private readonly IClientContext _client;

        public RefreshTokenCommandHandler(
            IRefreshTokenRepository refreshTokens,
            IUserRepository users,
            ILoginSessionRepository sessions,
            IJwtTokenGenerator jwt,
            IClientContext client)
        {
            _refreshTokens = refreshTokens;
            _users = users;
            _sessions = sessions;
            _jwt = jwt;
            _client = client;
        }

        public async Task<LoginResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var storedToken = await _refreshTokens.GetByTokenAsync(request.Request.Token, cancellationToken);

            if (storedToken == null)
            {
                throw new ForbiddenException("Invalid refresh token.");
            }

            if (!storedToken.IsActive)
            {
                throw new ForbiddenException("Refresh token is expired or revoked.");
            }

            var user = await _users.GetByIdAsync(storedToken.UserId);
            if (user == null || !user.CanLogin())
            {
                throw new ForbiddenException("User not found or inactive.");
            }

            // Revoke Old Token
            storedToken.RevokedAt = DateTime.UtcNow;

            // Generate New Refresh Token
            var newRefreshTokenString = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            
            storedToken.ReplacedByToken = newRefreshTokenString;
            await _refreshTokens.UpdateAsync(storedToken);

            var newRefreshTokenDomain = new RefreshTokenDomain(
                user.Id,
                newRefreshTokenString,
                DateTime.UtcNow.AddDays(7), // Expiry time (7 days)
                DateTime.UtcNow
            );
            await _refreshTokens.AddAsync(newRefreshTokenDomain);

            // Create new session
            var session = new LoginSessionDomain(
                user.Id,
                _client.DeviceName,
                _client.IpAddress,
                _client.UserAgent);
            await _sessions.AddAsync(session);

            return new LoginResponseDto
            {
                SessionId = session.Id,
                AccessToken = _jwt.GenerateToken(user, session.Id),
                RefreshToken = newRefreshTokenString,
                ExpiredAt = _jwt.GetExpiredAt()
            };
        }
    }
}
