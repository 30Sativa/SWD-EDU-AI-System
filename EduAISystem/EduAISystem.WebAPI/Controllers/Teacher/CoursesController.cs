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
    [Route("api/teacher/courses")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CoursesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyCourses(
            [FromQuery] GetMyCoursesQuery query,
            CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            query.TeacherId = teacherId.Value;

            var result = await _mediator.Send(query, cancellationToken);

            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>
                .Ok(result, "Danh sách khóa học của tôi"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateCourse(
            [FromBody] CreateCourseRequestDto dto,
            CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            var result = await _mediator.Send(new CreateCourseCommand
            {
                TeacherId = teacherId.Value,
                Request = dto
            }, cancellationToken);

            return Ok(ApiResponse<CourseDetailResponseDto>
                .Ok(result, "Tạo khóa học thành công"));
        }

        [HttpPost("{id:guid}/publish")]
        public async Task<IActionResult> PublishCourse(
            Guid id,
            CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            var success = await _mediator.Send(new PublishCourseCommand
            {
                CourseId = id,
                TeacherId = teacherId.Value
            }, cancellationToken);

            if (!success)
                return NotFound();

            return Ok(ApiResponse<object>.Ok(null, "Publish thành công"));
        }

        private Guid? GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userId, out var id) ? id : null;
        }
    }
}
