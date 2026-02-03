using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Request;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [HttpPost]
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
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy khóa học hoặc bạn không có quyền publish"));
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
