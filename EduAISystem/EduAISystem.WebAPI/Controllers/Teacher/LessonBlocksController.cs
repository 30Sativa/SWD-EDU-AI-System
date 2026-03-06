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

        // ===== CREATE (MANUAL) =====
        [HttpPost]
        [SwaggerOperation(
            Summary = "Tạo block mới (thủ công)",
            Description = "Giáo viên tự nhập nội dung. BlockType hợp lệ: 'Concept', 'Example', 'Exercise', 'Reflection'")]
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

        // ===== GENERATE AI BLOCKS =====
        [HttpPost("generate-ai")]
        [SwaggerOperation(
            Summary = "Sinh nội dung blocks bằng AI (CanUseAI phải = true)",
            Description = """
                Yêu cầu AI sinh các LessonBlock theo chuẩn sư phạm: Concept → Example → Exercise → Reflection.

                **Điều kiện sử dụng**: Lesson phải có CanUseAI = true.

                **Nguồn đầu vào (InputSourceType)**:
                - `Text`: Giáo viên gõ nội dung trực tiếp vào InputContent
                - `PDF`: Nội dung text đã được trích xuất từ file PDF (dùng /extract-text trước)
                - `File`: Nội dung text đã được trích xuất từ file DOCX/PPTX

                **Chế độ SaveToDB**:
                - `false` (mặc định): Chỉ trả về preview để giáo viên review trước
                - `true`: Lưu luôn vào DB và trả về IDs của các blocks

                **Lưu ý**: AI là OPTIONAL – giáo viên vẫn có thể tạo block thủ công qua POST /blocks.
                """)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<GenerateAiLessonBlocksResult>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GenerateAiBlocks(
            Guid lessonId,
            [FromBody] GenerateAiLessonBlocksRequestDto dto,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GenerateAiLessonBlocksCommand(lessonId, dto), ct);

            var message = result.IsSaved
                ? $"AI đã sinh và lưu {result.TotalBlocks} blocks thành công"
                : $"AI đã sinh {result.TotalBlocks} blocks (preview – chưa lưu vào DB). Gửi lại với SaveToDB=true để lưu.";

            return Ok(ApiResponse<GenerateAiLessonBlocksResult>.Ok(result, message));
        }
    }
}

