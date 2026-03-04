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
    [Route("api/teacher/lessons/{lessonId:guid}/blocks")]
    [ApiController]
    [Authorize]
    public class LessonBlocksController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LessonBlocksController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ===== GET ALL =====
        [HttpGet]
        [SwaggerOperation(Summary = "Danh sách blocks của lesson", Description = "Lấy tất cả blocks thuộc một lesson, sắp xếp theo SortOrder")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<LessonBlockResponseDto>>))]
        public async Task<IActionResult> GetBlocks(Guid lessonId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetLessonBlocksQuery(lessonId), ct);
            return Ok(ApiResponse<List<LessonBlockResponseDto>>.Ok(result, "Danh sách blocks"));
        }

        // ===== GET BY ID =====
        [HttpGet("{id:guid}")]
        [SwaggerOperation(Summary = "Chi tiết block")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<LessonBlockResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetBlock(Guid lessonId, Guid id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetLessonBlockByIdQuery(id), ct);
            if (result == null)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy block"));
            return Ok(ApiResponse<LessonBlockResponseDto>.Ok(result, "Chi tiết block"));
        }

        // ===== CREATE =====
        [HttpPost]
        [SwaggerOperation(Summary = "Tạo block mới", Description = "BlockType có thể là: Text, Video, Image, File, Quiz, Code, ...")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> CreateBlock(Guid lessonId, [FromBody] CreateLessonBlockRequestDto dto, CancellationToken ct)
        {
            var id = await _mediator.Send(new CreateLessonBlockCommand(lessonId, dto), ct);
            return Ok(ApiResponse<Guid>.Ok(id, "Tạo block thành công"));
        }

        // ===== UPDATE =====
        [HttpPut("{id:guid}")]
        [SwaggerOperation(Summary = "Cập nhật block")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateBlock(Guid lessonId, Guid id, [FromBody] UpdateLessonBlockRequestDto dto, CancellationToken ct)
        {
            await _mediator.Send(new UpdateLessonBlockCommand(id, dto), ct);
            return Ok(ApiResponse<object>.Ok(null, "Cập nhật block thành công"));
        }

        // ===== DELETE =====
        [HttpDelete("{id:guid}")]
        [SwaggerOperation(Summary = "Xoá block")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteBlock(Guid lessonId, Guid id, CancellationToken ct)
        {
            await _mediator.Send(new DeleteLessonBlockCommand(id), ct);
            return Ok(ApiResponse<object>.Ok(null, "Xoá block thành công"));
        }
    }
}
