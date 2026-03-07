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
                - `false` (mặc định): Trả về preview + cache 30 phút. Teacher có thể review, edit rồi save qua /save-preview
                - `true`: Lưu luôn vào DB và trả về IDs

                **Resilience**: 
                - Retry tự động 3 lần nếu Gemini lỗi tạm (5xx, 429, network)
                - Timeout 60s (cấu hình trong appsettings)
                - Circuit breaker ngắt nếu lỗi liên tiếp 5 lần

                **Giới hạn InputContent**: Tối thiểu 20 ký tự, tối đa 50.000 ký tự (~20 trang).

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
                : $"AI đã sinh {result.TotalBlocks} blocks (preview – cache 30 phút). " +
                  "Dùng GET /preview để xem lại, hoặc POST /save-preview để lưu (có thể edit trước).";

            return Ok(ApiResponse<GenerateAiLessonBlocksResult>.Ok(result, message));
        }

        // ===== GET AI PREVIEW (từ cache) =====
        [HttpGet("preview")]
        [SwaggerOperation(
            Summary = "Lấy AI preview đã cache",
            Description = """
                Lấy lại preview blocks đã được AI sinh ra (cache 30 phút).
                
                **Khi nào dùng?**
                - Teacher gọi generate-ai với SaveToDB=false → nhận preview
                - Teacher refresh trang → gọi endpoint này để lấy lại preview
                - Teacher muốn xem lại trước khi quyết định save
                
                **Lưu ý**: Preview hết hạn sau 30 phút. Nếu hết hạn cần generate lại.
                """)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<GenerateAiLessonBlocksResult>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAiPreview(Guid lessonId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetAiPreviewQuery(lessonId), ct);

            if (result == null)
                return NotFound(ApiResponse<object>.Fail(
                    "Không có preview nào trong cache. Preview hết hạn sau 30 phút. Vui lòng gọi generate-ai để tạo mới."));

            return Ok(ApiResponse<GenerateAiLessonBlocksResult>.Ok(result,
                $"Preview {result.TotalBlocks} blocks (chưa lưu). Dùng POST /save-preview để lưu."));
        }

        // ===== SAVE AI PREVIEW (có thể edit) =====
        [HttpPost("save-preview")]
        [SwaggerOperation(
            Summary = "Lưu blocks từ AI preview vào DB (có thể chỉnh sửa trước)",
            Description = """
                Lưu các blocks từ AI preview vào DB. Teacher có thể chỉnh sửa trước khi lưu.

                **Flow đề xuất**:
                1. `POST /generate-ai` (SaveToDB=false) → nhận preview
                2. Teacher review + chỉnh sửa nội dung trên UI
                3. `POST /save-preview` → gửi blocks đã chỉnh sửa → lưu vào DB

                **Teacher có thể**:
                - Giữ nguyên nội dung từ preview
                - Chỉnh sửa content, blockType, sortOrder, estimatedMinutes
                - Bỏ bớt blocks không muốn (chỉ gửi blocks muốn lưu)

                **Sau khi save**: preview bị xoá khỏi cache.
                """)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<Guid>>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SaveAiPreview(
            Guid lessonId,
            [FromBody] SaveAiPreviewRequestDto dto,
            CancellationToken ct)
        {
            var savedIds = await _mediator.Send(new SaveAiPreviewCommand(lessonId, dto), ct);
            return Ok(ApiResponse<List<Guid>>.Ok(savedIds,
                $"Đã lưu {savedIds.Count} blocks vào DB thành công."));
        }
    }
}
