using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Users.DTOs.Response;
using EduAISystem.Application.Features.Users.Queries;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Users.Handler
{
    public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserDetailResponseDto>
    {
        private readonly IUserRepository _userRepository;

        public GetCurrentUserQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task<UserDetailResponseDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId) ?? throw new NotFoundException("User not found");

            return new UserDetailResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = (int)user.Role,
                IsActive = user.IsActive,
                Profile = new UserProfileDetailDto
                {
                    FullName = user.UserProfile?.FullName,
                    Address = user.UserProfile?.Address,
                    DateOfBirth = user.UserProfile?.DateOfBirth,
                    Gender = user.UserProfile?.Gender,
                    PhoneNumber = user.UserProfile?.PhoneNumber,
                    AvatarUrl = user.UserProfile?.AvatarUrl,
                    Bio = user.UserProfile?.Bio
                }
            };
        }
    }
}
