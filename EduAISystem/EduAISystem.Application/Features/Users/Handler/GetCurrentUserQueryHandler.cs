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
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken) ?? throw new NotFoundException("User not found."); ;
           
            return new UserDetailResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                Role = (int)user.Role,
                Profile = user.UserProfile != null ? new UserProfileDetailDto
                {
                    FullName = user.UserProfile.FullName,
                    Gender = user.UserProfile.Gender,
                    AvatarUrl = user.UserProfile.AvatarUrl,
                    Bio = user.UserProfile.Bio,
                    DateOfBirth = user.UserProfile.DateOfBirth,
                    Address = user.UserProfile.Address,
                    PhoneNumber = user.UserProfile.PhoneNumber
                } : null
            };
        }
    }
}
