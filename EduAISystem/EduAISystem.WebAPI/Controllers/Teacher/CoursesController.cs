using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Request;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/courses")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CoursesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Danh sách khóa học",
            Description = "Lấy danh sách tất cả khóa học có phân trang và filter, có thể lọc theo trạng thái đã xóa/chưa xóa"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseListItemResponseDto>>))]
        public async Task<IActionResult> GetCourses([FromQuery] GetCoursesQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>.Ok(result, "Lấy danh sách khóa học có phân trang"));
        }

        [HttpDelete("{id:guid}")]
        [SwaggerOperation(
            Summary = "Xóa mềm khóa học",
            Description = "Chỉ cho phép xóa mềm khóa học đang ở trạng thái Draft"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> SoftDeleteCourse(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _mediator.Send(new SoftDeleteCourseCommand { Id = id }, cancellationToken);
            if (!deleted)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy khóa học hoặc không thể xóa khóa học không ở trạng thái Draft"));
            }

            return Ok(ApiResponse<object>.Ok(null, "Đã xóa mềm khóa học"));
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "Tạo khóa học",
            Description = "Giáo viên tạo khóa học mới gắn với tài khoản hiện tại"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequestDto dto, CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Không tìm thấy UserId trong token"));
            }

            var result = await _mediator.Send(new CreateCourseCommand
            {
                TeacherId = teacherId.Value,
                Request = dto
            }, cancellationToken);

            return Ok(ApiResponse<CourseDetailResponseDto>.Ok(result, "Tạo khóa học thành công"));
        }

        [HttpGet("{id:guid}")]
        [SwaggerOperation(
            Summary = "Chi tiết khóa học",
            Description = "Lấy thông tin khóa học theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<CourseDetailResponseDto?>))]
        public async Task<IActionResult> GetCourseById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetCourseByIdQuery { Id = id }, cancellationToken);
            if (result == null)
            {
                return NotFound(ApiResponse<CourseDetailResponseDto?>.Fail("Không tìm thấy khóa học"));
            }

            return Ok(ApiResponse<CourseDetailResponseDto>.Ok(result, "Lấy chi tiết khóa học thành công"));
        }

        [HttpGet("my")]
        [SwaggerOperation(
            Summary = "Khóa học của tôi",
            Description = "Lấy danh sách khóa học thuộc giáo viên hiện tại"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseListItemResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetMyCourses([FromQuery] GetMyCoursesQuery query, CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Không tìm thấy UserId trong token"));
            }

            query.TeacherId = teacherId.Value;

            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>.Ok(result, "Lấy danh sách khóa học của giáo viên"));
        }

        [HttpPost("{id:guid}/publish")]
        [SwaggerOperation(
            Summary = "Publish khóa học",
            Description = "Xuất bản khóa học sau khi đã soạn nội dung"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> PublishCourse(Guid id, CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Không tìm thấy UserId trong token"));
            }

            var success = await _mediator.Send(new PublishCourseCommand
            {
                CourseId = id,
                TeacherId = teacherId.Value
            }, cancellationToken);
            if (!success)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy khóa học, bạn không có quyền hoặc khóa học chưa đủ thông tin tối thiểu để publish"));
            }

            return Ok(ApiResponse<object>.Ok(null, "Publish khóa học thành công"));
        }

        private Guid? GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return null;
            }

            return Guid.TryParse(userId, out var id) ? id : null;
        }
    }
}
