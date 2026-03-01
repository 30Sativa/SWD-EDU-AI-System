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

        [HttpGet("templates")]
        [SwaggerOperation(Summary = "Danh sách Template khóa học", Description = "Giáo viên xem các template có sẵn để clone")]
        public async Task<IActionResult> GetTemplates([FromQuery] GetCoursesQuery query, CancellationToken cancellationToken)
        {
            query.IsTemplate = true;
            query.IsActive = true;
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>.Ok(result));
        }

        private Guid? GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userId, out var id) ? id : null;
        }

        [HttpPost("clone")]
        [SwaggerOperation(Summary = "Clone từ Template", Description = "Tạo khóa học cá nhân từ khung nội dung chuẩn")]
        public async Task<IActionResult> CloneFromTemplate([FromBody] CloneTemplateCourseRequestDto dto,CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            var id = await _mediator.Send(
                new CloneTemplateCourseCommand(dto),
                cancellationToken);

            return Ok(ApiResponse<Guid>
                .Ok(id, "Clone khóa học thành công"));
        }

        [HttpPost("{id:guid}/classes/{classId:guid}")]
        [SwaggerOperation(Summary = "Gán lớp vào khóa học", Description = "Giáo viên gán lớp học vào chương trình dạy (chỉ giáo viên được phân công mới thực hiện được)")]
        public async Task<IActionResult> AssignClass(Guid id, Guid classId, CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            var result = await _mediator.Send(new AssignClassToCourseCommand
            {
                CourseId = id,
                ClassId = classId,
                TeacherId = teacherId.Value
            }, cancellationToken);

            return Ok(ApiResponse<object>.Ok(null, "Gán lớp thành công."));
        }
    }
}
