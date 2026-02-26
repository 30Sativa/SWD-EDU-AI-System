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

        public CreateUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
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

            await _userRepository.AddAsync(user);

            return new UserDetailResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = (int)user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                Profile = new UserProfileDetailDto
                {
                    FullName = user.UserProfile.FullName
                }
            };
        }
    }
}
