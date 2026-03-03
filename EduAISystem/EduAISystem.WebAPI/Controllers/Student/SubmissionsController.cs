using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Submissions.Commands;
using EduAISystem.Application.Features.Submissions.DTOs.Request;
using EduAISystem.Application.Features.Submissions.DTOs.Response;
using EduAISystem.Application.Features.Submissions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/submissions")]
    [ApiController]
    [Authorize]
    public class SubmissionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SubmissionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("assignment/{assignmentId:guid}")]
        [SwaggerOperation(
            Summary = "HS - Nộp bài assignment",
            Description = "Học sinh nộp bài (text/fileUrl) cho một assignment; nếu đã có bài trước đó thì sẽ ghi nhận lần nộp mới nhất"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Submit(
            Guid assignmentId,
            [FromBody] SubmitAssignmentRequestDto dto,
            CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(
                new SubmitAssignmentCommand(assignmentId, dto),
                cancellationToken);

            return Ok(ApiResponse<Guid>.Ok(id, "Nộp bài thành công."));
        }

        [HttpGet("assignment/{assignmentId:guid}/me")]
        [SwaggerOperation(
            Summary = "HS - Xem bài nộp của mình",
            Description = "Học sinh xem lại bài nộp mới nhất + điểm/feedback (nếu đã được chấm)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SubmissionSummaryResponseDto?>))]
        public async Task<IActionResult> GetMySubmission(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetMySubmissionForAssignmentQuery(assignmentId),
                cancellationToken);

            return Ok(ApiResponse<SubmissionSummaryResponseDto?>.Ok(result));
        }
    }
}

