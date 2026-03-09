using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/students")]
    [ApiController]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CoursesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ===========================
        // GET COURSES BY STUDENT ID
        // ===========================
        [HttpGet("{studentId:guid}/courses")]
        [SwaggerOperation(
            Summary = "HS - Lấy danh sách khóa học theo student",
            Description = @"
Trả về các khóa học được gán cho LỚP mà student đang thuộc (StudentClass → CourseClass → Course). 
Hỗ trợ phân trang, tìm kiếm và filter theo status."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseListItemResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCoursesByStudentId(
            Guid studentId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? status = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetCoursesByStudentIdQuery
            {
                StudentId = studentId,
                Page = page,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                Status = status
            }, cancellationToken);

            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>
                .Ok(result, $"Danh sách khóa học của student {studentId}"));
        }
    }
}
