using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Users.DTOs.Request;
using EduAISystem.Application.Features.Users.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Users.Queries
{
    public class ListUsersQuery : UserListRequestDto, IRequest<PagedResult<UserListResponseDto>>
    {
        public string? SearchTerm { get; set; }
        public int? RoleFilter { get; set; }
        public bool? IsActiveFilter { get; set; }
        public bool? IncludeDeleted { get; set; } // For admin to see deleted users
    }
}
