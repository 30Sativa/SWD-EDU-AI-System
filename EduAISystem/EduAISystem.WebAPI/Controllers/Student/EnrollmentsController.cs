using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Enrollments.Commands;
using EduAISystem.Application.Features.Enrollments.DTOs.Response;
using EduAISystem.Application.Features.Enrollments.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/courses")]
    [ApiController]
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
            Summary = "Đăng ký khóa học",
            Description = "Sinh viên đăng ký khóa học đã publish"
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
            Summary = "Danh sách khóa học đã đăng ký",
            Description = "Lấy danh sách khóa học của sinh viên hiện tại"
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
    }
}
