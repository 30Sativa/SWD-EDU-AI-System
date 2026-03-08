using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Assignments.DTOs.Response;
using EduAISystem.Application.Features.Assignments.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/assignments")]
    [ApiController]
    [Authorize]
    public class AssignmentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AssignmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("course/{courseId:guid}")]
        [SwaggerOperation(
            Summary = "HS - Danh sách bài tập theo khóa học",
            Description = "Học sinh xem danh sách assignment đã publish của một course. Mỗi item trả về kèm cấu hình nộp bài (AllowedFileTypes, MaxFileSizeMB, AllowTextSubmit, AllowFileSubmit) để FE biết giới hạn loại file, dung lượng và hình thức nộp."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<AssignmentSummaryResponseDto>>))]
        public async Task<IActionResult> GetByCourse(
            Guid courseId,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetAssignmentsByCourseForStudentQuery(courseId),
                cancellationToken);

            return Ok(ApiResponse<List<AssignmentSummaryResponseDto>>.Ok(result));
        }
    }
}

