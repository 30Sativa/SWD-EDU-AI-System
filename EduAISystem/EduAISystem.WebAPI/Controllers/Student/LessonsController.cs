using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Request;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/lessons")]
    [ApiController]
    [Authorize]
    public class LessonsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LessonsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("{lessonId:guid}/progress")]
        [SwaggerOperation(
            Summary = "Student - Cập nhật tiến độ học tập bài học",
            Description = "Cập nhật thời lượng xem video và đánh dấu hoàn thành bài học. Đồng thời server sẽ tự động tính lại tổng tiến độ (Enrollment.Progress) của Course."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
        public async Task<IActionResult> UpdateProgress(
            Guid lessonId,
            [FromBody] UpdateLessonProgressRequestDto dto,
            CancellationToken cancellationToken)
        {
            var command = new UpdateLessonProgressCommand(lessonId, dto);
            await _mediator.Send(command, cancellationToken);

            return Ok(ApiResponse<bool>.Ok(true, "Cập nhật tiến độ thành công"));
        }
    }
}
