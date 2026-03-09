using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Submissions.Commands;
using EduAISystem.Application.Features.Submissions.DTOs.Request;
using EduAISystem.Application.Features.Submissions.DTOs.Response;
using EduAISystem.Application.Features.Submissions.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/submissions")]
    [ApiController]
    public class SubmissionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SubmissionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("assignment/{assignmentId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Danh sách submissions theo assignment",
            Description = "Giáo viên xem tất cả bài nộp của học sinh cho một assignment"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<SubmissionSummaryResponseDto>>))]
        public async Task<IActionResult> GetByAssignment(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetSubmissionsByAssignmentQuery(assignmentId),
                cancellationToken);

            return Ok(ApiResponse<List<SubmissionSummaryResponseDto>>.Ok(result));
        }

        [HttpPost("{submissionId:guid}/grade")]
        [SwaggerOperation(
            Summary = "GV - Chấm điểm và feedback cho submission",
            Description = "Giáo viên chấm điểm + nhận xét cho một bài nộp; có thể chấm lại nhiều lần"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Grade(
            Guid submissionId,
            [FromBody] GradeSubmissionRequestDto dto,
            CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(
                new GradeSubmissionCommand(submissionId, dto),
                cancellationToken);

            return Ok(ApiResponse<Guid>.Ok(id, "Chấm điểm submission thành công."));
        }
    }
}

