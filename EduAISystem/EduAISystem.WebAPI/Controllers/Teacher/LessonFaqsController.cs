using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Request;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/lessons/{lessonId:guid}/faqs")]
    [ApiController]
    [Authorize]
    public class LessonFaqsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LessonFaqsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ===== GET ALL =====
        [HttpGet]
        [SwaggerOperation(Summary = "Danh sách FAQ của lesson", Description = "Lấy tất cả câu hỏi thường gặp của lesson, sắp xếp theo SortOrder")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<LessonFaqResponseDto>>))]
        public async Task<IActionResult> GetFaqs(Guid lessonId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetLessonFaqsQuery(lessonId), ct);
            return Ok(ApiResponse<List<LessonFaqResponseDto>>.Ok(result, "Danh sách FAQ"));
        }

        // ===== GET BY ID =====
        [HttpGet("{id:guid}")]
        [SwaggerOperation(Summary = "Chi tiết FAQ")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<LessonFaqResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetFaq(Guid lessonId, Guid id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetLessonFaqByIdQuery(id), ct);
            if (result == null)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy FAQ"));
            return Ok(ApiResponse<LessonFaqResponseDto>.Ok(result, "Chi tiết FAQ"));
        }

        // ===== CREATE =====
        [HttpPost]
        [SwaggerOperation(Summary = "Tạo FAQ mới")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> CreateFaq(Guid lessonId, [FromBody] CreateLessonFaqRequestDto dto, CancellationToken ct)
        {
            var id = await _mediator.Send(new CreateLessonFaqCommand(lessonId, dto), ct);
            return Ok(ApiResponse<Guid>.Ok(id, "Tạo FAQ thành công"));
        }

        // ===== UPDATE =====
        [HttpPut("{id:guid}")]
        [SwaggerOperation(Summary = "Cập nhật FAQ")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateFaq(Guid lessonId, Guid id, [FromBody] UpdateLessonFaqRequestDto dto, CancellationToken ct)
        {
            await _mediator.Send(new UpdateLessonFaqCommand(id, dto), ct);
            return Ok(ApiResponse<object>.Ok(null, "Cập nhật FAQ thành công"));
        }

        // ===== DELETE =====
        [HttpDelete("{id:guid}")]
        [SwaggerOperation(Summary = "Xoá FAQ")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteFaq(Guid lessonId, Guid id, CancellationToken ct)
        {
            await _mediator.Send(new DeleteLessonFaqCommand(id), ct);
            return Ok(ApiResponse<object>.Ok(null, "Xoá FAQ thành công"));
        }
    }
}
