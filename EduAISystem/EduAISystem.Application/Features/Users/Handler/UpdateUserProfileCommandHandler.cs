using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Users.Commands;
using EduAISystem.Application.Features.Users.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Users.Handler
{
    public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, UserDetailResponseDto?>
    {
        private readonly IUserRepository _userRepository;

        public UpdateUserProfileCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserDetailResponseDto?> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user == null)
                return null;

            var profile = new UserProfileDomain(
                request.UserId,
                request.Request.FullName,
                request.Request.AvatarUrl,
                request.Request.PhoneNumber,
                request.Request.DateOfBirth,
                request.Request.Gender,
                request.Request.Address,
                request.Request.Bio);

            await _userRepository.UpdateProfileAsync(request.UserId, profile, cancellationToken);

            var updatedUser = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (updatedUser == null)
                return null;

            var profileDto = updatedUser.UserProfile == null
                ? null
                : new UserProfileDetailDto
                {
                    FullName = updatedUser.UserProfile.FullName,
                    AvatarUrl = updatedUser.UserProfile.AvatarUrl,
                    PhoneNumber = updatedUser.UserProfile.PhoneNumber,
                    DateOfBirth = updatedUser.UserProfile.DateOfBirth,
                    Gender = updatedUser.UserProfile.Gender,
                    Address = updatedUser.UserProfile.Address,
                    Bio = updatedUser.UserProfile.Bio
                };

            return new UserDetailResponseDto
            {
                Id = updatedUser.Id,
                Email = updatedUser.Email,
                UserName = updatedUser.UserName,
                Role = (int)updatedUser.Role,
                IsActive = updatedUser.IsActive,
                CreatedAt = updatedUser.CreatedAt,
                Profile = profileDto
            };
        }
    }
}
