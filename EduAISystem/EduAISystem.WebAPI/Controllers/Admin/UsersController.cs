using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Users.Commands;
using EduAISystem.Application.Features.Users.DTOs.Request;
using EduAISystem.Application.Features.Users.DTOs.Response;
using EduAISystem.Application.Features.Users.Queries;
using EduAISystem.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduAISystem.WebAPI.Controllers.Admin
{
    [Route("api/admin/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] ListUsersQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<UserListResponseDto>>.Ok(result, "Lấy danh sách người dùng có phân trang"));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUserById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetUserByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<UserDetailResponseDto?>.Fail("Không tìm thấy người dùng"));
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Lấy thông tin người dùng thành công"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateUserCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Tạo người dùng thành công"));
        }

        [HttpPost("students")]
        public async Task<IActionResult> CreateStudent([FromBody] CreateUserRequestDto dto, CancellationToken cancellationToken)
        {
            // Đảm bảo luôn là học sinh
            dto.Role = (int)UserRoleDomain.User;

            var result = await _mediator.Send(new CreateUserCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Tạo tài khoản học sinh thành công"));
        }

        [HttpPost("teachers")]
        public async Task<IActionResult> CreateTeacher([FromBody] CreateUserRequestDto dto, CancellationToken cancellationToken)
        {
            // Hiện tại hệ thống dùng Role = User cho cả giáo viên/học sinh,
            // việc phân biệt dựa trên bảng Teacher/Student ở tầng persistence.
            dto.Role = (int)UserRoleDomain.User;

            var result = await _mediator.Send(new CreateUserCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Tạo tài khoản giáo viên thành công"));
        }

        [HttpPost("admins")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateUserRequestDto dto, CancellationToken cancellationToken)
        {
            dto.Role = (int)UserRoleDomain.Admin;

            var result = await _mediator.Send(new CreateUserCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Tạo tài khoản admin thành công"));
        }

        [HttpPost("managers")]
        public async Task<IActionResult> CreateManager([FromBody] CreateUserRequestDto dto, CancellationToken cancellationToken)
        {
            dto.Role = (int)UserRoleDomain.Manager;

            var result = await _mediator.Send(new CreateUserCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Tạo tài khoản manager thành công"));
        }

        [HttpPut("{id:guid}/profile")]
        public async Task<IActionResult> UpdateUserProfile(Guid id, [FromBody] UpdateUserProfileRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateUserProfileCommand { UserId = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<UserDetailResponseDto?>.Fail("Không tìm thấy người dùng"));
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Cập nhật hồ sơ thành công"));
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> SoftDeleteUser(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _mediator.Send(new SoftDeleteUserCommand { Id = id }, cancellationToken);
            if (!deleted)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            return Ok(ApiResponse<object>.Ok(null, "Đã đánh dấu xóa người dùng"));
        }
    }
}
