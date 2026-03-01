using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Users.Commands;
using EduAISystem.Application.Features.Users.DTOs.Request;
using EduAISystem.Application.Features.Users.DTOs.Response;
using EduAISystem.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

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
        [SwaggerOperation(
            Summary = "Danh sách người dùng",
            Description = "Lấy toàn bộ người dùng kèm phân trang và bộ lọc. Dùng includeDeleted=true để xem cả người dùng đã bị xóa mềm. Response bao gồm IsDeleted và DeletedAt để hiển thị status."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<UserListResponseDto>>))]
        public async Task<IActionResult> GetAllUsers([FromQuery] ListUsersQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<UserListResponseDto>>.Ok(result, "Lấy danh sách người dùng có phân trang"));
        }

        [HttpGet("{id:guid}")]
        [SwaggerOperation(
            Summary = "Chi tiết người dùng",
            Description = "Lấy thông tin chi tiết của người dùng theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<UserDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<UserDetailResponseDto?>))]
        public async Task<IActionResult> GetUserById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetUserByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<UserDetailResponseDto?>.Fail("Không tìm thấy người dùng"));
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Lấy thông tin người dùng thành công"));
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "Tạo người dùng",
            Description = "Tạo mới người dùng với thông tin hồ sơ và vai trò"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<UserDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateUserCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Tạo người dùng thành công"));
        }

        [HttpPut("{id:guid}/profile")]
        [SwaggerOperation(
            Summary = "Cập nhật hồ sơ",
            Description = "Cập nhật thông tin cá nhân của người dùng"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<UserDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<UserDetailResponseDto?>))]
        public async Task<IActionResult> UpdateUserProfile(Guid id, [FromBody] UpdateUserProfileRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateUserProfileCommand { UserId = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<UserDetailResponseDto?>.Fail("Không tìm thấy người dùng"));
            return Ok(ApiResponse<UserDetailResponseDto>.Ok(result, "Cập nhật hồ sơ thành công"));
        }

        [HttpDelete("{id:guid}")]
        [SwaggerOperation(
            Summary = "Xóa mềm người dùng",
            Description = "Đánh dấu người dùng đã xóa thay vì xóa vĩnh viễn"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> SoftDeleteUser(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _mediator.Send(new SoftDeleteUserCommand { Id = id }, cancellationToken);
            if (!deleted)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            return Ok(ApiResponse<object>.Ok(null, "Đã đánh dấu xóa người dùng"));
        }
        [HttpPost("import")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportUsers(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is required");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);

            var command = new ImportUsersCommand(
                file.FileName,
                ms.ToArray()
            );

            await _mediator.Send(command);

            return Ok(ApiResponse<object>.Ok(null,"Import thành công"));
        }
    }
}
