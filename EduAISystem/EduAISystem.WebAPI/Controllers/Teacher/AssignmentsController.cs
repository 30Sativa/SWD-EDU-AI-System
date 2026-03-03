using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Assignments.Commands;
using EduAISystem.Application.Features.Assignments.DTOs.Request;
using EduAISystem.Application.Features.Assignments.DTOs.Response;
using EduAISystem.Application.Features.Assignments.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/assignments")]
    [ApiController]
    public class AssignmentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AssignmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "GV - Tạo bài tập cho khóa học",
            Description = "Giáo viên tạo assignment gắn với một course, có thể chọn publish ngay"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Create(
            [FromBody] CreateAssignmentRequestDto dto,
            CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(new CreateAssignmentCommand(dto), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(id, "Tạo assignment thành công."));
        }

        [HttpPut("{assignmentId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật bài tập",
            Description = "Giáo viên cập nhật tiêu đề, mô tả, hạn nộp, điểm tối đa của assignment"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Update(
            Guid assignmentId,
            [FromBody] UpdateAssignmentRequestDto dto,
            CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(new UpdateAssignmentCommand(assignmentId, dto), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(id, "Cập nhật assignment thành công."));
        }

        [HttpDelete("{assignmentId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Xoá bài tập",
            Description = "Giáo viên xoá assignment khỏi course (cân nhắc policy khi đã có submission)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Delete(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteAssignmentCommand(assignmentId), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(assignmentId, "Xoá assignment thành công."));
        }

        [HttpPost("{assignmentId:guid}/publish")]
        [SwaggerOperation(
            Summary = "GV - Publish bài tập",
            Description = "Giáo viên publish assignment để học sinh nhìn thấy và nộp bài"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Publish(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(new PublishAssignmentCommand(assignmentId), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(id, "Publish assignment thành công."));
        }

        [HttpPost("{assignmentId:guid}/unpublish")]
        [SwaggerOperation(
            Summary = "GV - Unpublish bài tập",
            Description = "Giáo viên ẩn assignment (chuyển về Draft), học sinh mới sẽ không thấy"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Unpublish(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(new UnpublishAssignmentCommand(assignmentId), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(id, "Unpublish assignment thành công."));
        }

        [HttpGet("course/{courseId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Danh sách bài tập theo khóa học",
            Description = "Giáo viên xem tất cả assignment (Draft/Published) của một course"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<AssignmentSummaryResponseDto>>))]
        public async Task<IActionResult> GetByCourse(
            Guid courseId,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetAssignmentsByCourseForTeacherQuery(courseId),
                cancellationToken);

            return Ok(ApiResponse<List<AssignmentSummaryResponseDto>>.Ok(result));
        }
    }
}

