using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Users.Commands;
using EduAISystem.Application.Features.Users.DTOs.Response;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using MediatR;

namespace EduAISystem.Application.Features.Users.Handler
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDetailResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailService _emailService;

        public CreateUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, IEmailService emailService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
        }

        public async Task<UserDetailResponseDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var existUser = await _userRepository.GetByEmailAsync(request.Request.Email);
            if (existUser != null)
                throw new ConflictException("Email đã tồn tại.");

            var passwordHash = _passwordHasher.Hash(request.Request.Password);
            var user = UserDomain.Create(
                request.Request.Email,
                passwordHash,
                request.Request.FullName,
                (UserRoleDomain)request.Request.Role);

            // Admin tạo → verify sẵn email và yêu cầu đổi pass lần đầu
            user.VerifyEmail();
            user.MarkAsFirstLogin();

            await _userRepository.AddAsync(user);

            try
            {
                // Gửi email chào mừng kèm mật khẩu (vì password không bị che như lúc register)
                await _emailService.SendWelcomeEmail(user.Email, request.Request.Password);
            }
            catch (Exception ex)
            {
                // In ra console để bạn dễ theo dõi lỗi khi gửi mail thất bại
                Console.WriteLine($"[EMAIL ERROR at CreateUser]: {ex.Message}");
                if (ex.InnerException != null) 
                    Console.WriteLine($"[INNER ERROR]: {ex.InnerException.Message}");
            }

            return new UserDetailResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = (int)user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                IsDeleted = user.IsDeleted,
                DeletedAt = user.DeletedAt,
                Profile = new UserProfileDetailDto
                {
                    FullName = user.UserProfile!.FullName
                }
            };
        }
    }
}
