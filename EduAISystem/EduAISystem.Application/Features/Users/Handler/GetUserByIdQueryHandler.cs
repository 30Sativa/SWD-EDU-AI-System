using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Users.DTOs.Response;
using EduAISystem.Application.Features.Users.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Users.Handler
{
    public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDetailResponseDto?>
    {
        private readonly IUserRepository _userRepository;

        public GetUserByIdQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserDetailResponseDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
            if (user == null)
                return null;

            var profile = user.UserProfile == null
                ? null
                : new UserProfileDetailDto
                {
                    FullName = user.UserProfile.FullName,
                    AvatarUrl = user.UserProfile.AvatarUrl,
                    PhoneNumber = user.UserProfile.PhoneNumber,
                    DateOfBirth = user.UserProfile.DateOfBirth,
                    Gender = user.UserProfile.Gender,
                    Address = user.UserProfile.Address,
                    Bio = user.UserProfile.Bio
                };

            return new UserDetailResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = (int)user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                Profile = profile
            };
        }
    }
}
