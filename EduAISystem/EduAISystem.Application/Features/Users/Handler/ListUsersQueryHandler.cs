using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Users.DTOs.Response;
using EduAISystem.Application.Features.Users.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Users.Handler
{
    public class ListUsersQueryHandler : IRequestHandler<ListUsersQuery, PagedResult<UserListResponseDto>>
    {
        private readonly IUserRepository _userRepository;

        public ListUsersQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<PagedResult<UserListResponseDto>> Handle(ListUsersQuery request, CancellationToken cancellationToken)
        {
            var result = await _userRepository.GetUsersPagedAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.RoleFilter,
                request.IsActiveFilter,
                cancellationToken);

            //Mapping từ UserDomain sang UserListResponseDto
            var dtoItems = result.Items.Select(user => new UserListResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.UserProfile?.FullName,
                Role = (int)user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            }).ToList();

            return new PagedResult<UserListResponseDto>
            {
                Items = dtoItems,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }

    }
}
