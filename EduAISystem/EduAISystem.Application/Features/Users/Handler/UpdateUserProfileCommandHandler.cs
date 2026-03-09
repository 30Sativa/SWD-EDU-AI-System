using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Users.Commands;
using EduAISystem.Application.Features.Users.DTOs.Response;
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
                throw new NotFoundException("Không tìm thấy người dùng.");

            // Delegate all business logic to the Domain
            user.UpdateProfile(
                request.Request.FullName,
                request.Request.AvatarUrl,
                request.Request.PhoneNumber,
                request.Request.DateOfBirth,
                request.Request.Gender,
                request.Request.Address,
                request.Request.Bio);

            // Persist the updated profile via Repository
            await _userRepository.UpdateProfileAsync(request.UserId, user.UserProfile!, cancellationToken);

            // Map and return the updated user detail
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
                    FullName = user.UserProfile?.FullName ?? string.Empty,
                    AvatarUrl = user.UserProfile?.AvatarUrl,
                    PhoneNumber = user.UserProfile?.PhoneNumber,
                    DateOfBirth = user.UserProfile?.DateOfBirth,
                    Gender = user.UserProfile?.Gender,
                    Address = user.UserProfile?.Address,
                    Bio = user.UserProfile?.Bio
                }
            };
        }
    }
}
