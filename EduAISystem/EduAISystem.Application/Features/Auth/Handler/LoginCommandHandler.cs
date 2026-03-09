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
        private readonly IPasswordHasher _hasher;
        private readonly IJwtTokenGenerator _jwt;
        private readonly IClientContext _client;

        public LoginCommandHandler(
            IUserRepository users,
            ILoginSessionRepository sessions,
            IRefreshTokenRepository refreshTokens,
            IPasswordHasher hasher,
            IJwtTokenGenerator jwt,
            IClientContext client)
        {
            _users = users;
            _sessions = sessions;
            _refreshTokens = refreshTokens;
            _hasher = hasher;
            _jwt = jwt;
            _client = client;
        }

        public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _users.GetByEmailAsync(request.Request.Email) ?? throw new NotFoundException("User not found.");
            if(!user.CanLogin()) throw new ForbiddenException("User is inactive.");
            if (!_hasher.Verify(
            request.Request.Password,
            user.PasswordHash))
            {
                throw new ForbiddenException("Invalid credentials");
            }

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
