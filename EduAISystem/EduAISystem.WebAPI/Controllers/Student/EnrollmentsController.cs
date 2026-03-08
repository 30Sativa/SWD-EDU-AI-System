using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Enrollments.Commands;
using EduAISystem.Application.Features.Enrollments.DTOs.Response;
using EduAISystem.Application.Features.Enrollments.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/courses")]
    [ApiController]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public EnrollmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // =========================
        // ENROLL COURSE
        // =========================
        [HttpPost("{courseId}/enroll")]
        [SwaggerOperation(
            Summary = "HS - Đăng ký khóa học",
            Description = "Sinh viên đăng ký vào một khóa học cụ thể đã được publish."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Enroll(Guid courseId)
        {
            var result = await _mediator.Send(new EnrollCourseCommand(courseId));

            return Ok(ApiResponse<Guid>.Ok(result, "Enroll successfully"));
        }

        // =========================
        // GET MY COURSES
        // =========================
        [HttpGet("my")]
        [SwaggerOperation(
            Summary = "HS - Danh sách khóa học đã đăng ký",
            Description = "Lấy danh sách các khóa học mà học sinh hiện tại đã đăng ký kèm tiến độ học tập."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<MyEnrolledCourseResponseDto>>))]
        public async Task<IActionResult> GetMyCourses(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(
                new GetMyEnrolledCoursesQuery(page, pageSize));

            return Ok(ApiResponse<PagedResult<MyEnrolledCourseResponseDto>>
                .Ok(result, "Get enrolled courses successfully"));
        }

        // =========================
        // GET COURSE PROGRESS DETAIL
        // =========================
        [HttpGet("{courseId:guid}/progress")]
        [SwaggerOperation(
            Summary = "HS - Tiến độ chi tiết của khóa học",
            Description = "Lấy outline khóa học (sections, lessons) kèm trạng thái hoàn thành và thời lượng đã xem cho từng bài, cho học sinh hiện tại."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseProgressDetailResponseDto>))]
        public async Task<IActionResult> GetCourseProgress(
            Guid courseId,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetCourseProgressDetailQuery(courseId),
                cancellationToken);

            return Ok(ApiResponse<CourseProgressDetailResponseDto>
                .Ok(result, "Get course progress successfully"));
        }
    }
}
