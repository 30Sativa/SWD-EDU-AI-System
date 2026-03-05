using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Auth.Commands;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace EduAISystem.Application.Features.Auth.Handler
{
    /// <summary>
    /// Xử lý Register:
    /// 1. Kiểm tra email chưa tồn tại
    /// 2. Tạo user mới với IsEmailVerified = false
    /// 3. Tạo email verification token → lưu DB
    /// 4. Gửi link verify về email
    /// → User chỉ login được sau khi click link xác nhận trong email
    /// </summary>
    public class RegisterCommandHandle : IRequestHandler<RegisterCommand, RegisterResponseDto>
    {
        private readonly IUserRepository _users;
        private readonly IPasswordHasher _hasher;
        private readonly IEmailVerificationTokenRepository _verifyTokens;
        private readonly IEmailService _email;
        private readonly IConfiguration _config;

        public RegisterCommandHandle(
            IUserRepository users,
            IPasswordHasher hasher,
            IEmailVerificationTokenRepository verifyTokens,
            IEmailService email,
            IConfiguration config)
        {
            _users = users;
            _hasher = hasher;
            _verifyTokens = verifyTokens;
            _email = email;
            _config = config;
        }

        public async Task<RegisterResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra email đã tồn tại chưa
            var existEmail = await _users.GetByEmailAsync(request.Request.Email);
            if (existEmail != null)
                throw new ConflictException("Email already exists");

            // 2. Hash password và tạo user (IsEmailVerified = false)
            var passwordHash = _hasher.Hash(request.Request.PasswordHash);
            var user = UserDomain.Create(
                request.Request.Email,
                passwordHash,
                request.Request.FullName,
                UserRoleDomain.Student); // mặc định Student khi tự đăng ký

            await _users.AddAsync(user);

            // 3. Tạo email verification token
            var verifyToken = new EmailVerificationTokenDomain(user.Id, expiryHours: 24);
            await _verifyTokens.AddAsync(verifyToken, cancellationToken);

            // 4. Gửi link xác nhận về email
            var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:3000";
            var verifyLink = $"{frontendUrl}/verify-email?token={verifyToken.Token}";
            await _email.SendVerifyEmailAsync(user.Email, request.Request.FullName, verifyLink);

            return new RegisterResponseDto
            {
                UserId = user.Id,
                Email = user.Email
            };
        }
    }
}
