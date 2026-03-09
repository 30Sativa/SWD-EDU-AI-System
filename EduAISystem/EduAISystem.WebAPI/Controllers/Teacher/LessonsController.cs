using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Request;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Application.Features.Lessons.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Diagnostics;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/lessons")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<LessonsController> _logger;

        public LessonsController(IMediator mediator, ILogger<LessonsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        // GET: api/teacher/lessons/{id}
        [HttpGet("{id:guid}")]
        [SwaggerOperation(
            Summary = "GV - Chi tiết bài học",
            Description = "Giáo viên xem thông tin chi tiết của một bài học theo Id, bao gồm nội dung, tài liệu đính kèm và trạng thái sử dụng AI."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<LessonResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var result = await _mediator.Send(new GetLessonByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI LẤY BÀI HỌC THEO ID] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, id, ex.GetType().Name, ex.Message);
                throw; // ném lại để GlobalExceptionMiddleware xử lý response
            }
        }

        // GET: api/teacher/lessons/by-section/{sectionId}
        [HttpGet("by-section/{sectionId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Danh sách bài học theo section",
            Description = "Giáo viên xem tất cả bài học thuộc một section, sắp xếp theo thứ tự (SortOrder)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<LessonResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetBySection(Guid sectionId)
        {
            try
            {
                var result = await _mediator.Send(new GetLessonsBySectionIdQuery(sectionId));
                return Ok(result);
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI LẤY DANH SÁCH BÀI HỌC THEO SECTION] MãTrace: {TraceId} | MãSection: {SectionId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, sectionId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // POST: api/teacher/lessons
        [HttpPost]
        [SwaggerOperation(
            Summary = "GV - Tạo bài học mới",
            Description = @"
Giáo viên tạo một bài học mới trong một section của khóa học.

**Trường bắt buộc:** `SectionId`, `Title`

**Tùy chọn:**
- `CanUseAI`: cho phép AI sinh nội dung blocks (mặc định: false)
- `MaterialUrl` / `MaterialType`: tài liệu đính kèm (video, PDF, DOCX)
- Nếu muốn upload file tài liệu → dùng `POST /api/teacher/lessons/{id}/upload-material` trước rồi lấy URL

**Sau khi tạo:** Dùng `POST /api/teacher/lessons/{id}/blocks` để thêm nội dung block."
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> Create([FromBody] CreateLessonRequestDto dto)
        {
            try
            {
                await _mediator.Send(new CreateLessonCommand(dto));
                return NoContent();
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI TẠO BÀI HỌC MỚI] MãTrace: {TraceId} | MãSection: {SectionId} | Tiêu đề: {Title} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, dto?.SectionId, dto?.Title, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // PUT: api/teacher/lessons/{id}
        [HttpPut("{id:guid}")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật bài học",
            Description = @"
Giáo viên cập nhật thông tin bài học: tiêu đề, mô tả, tài liệu, thứ tự, trạng thái CanUseAI.

**Lưu ý:**
- Để cập nhật tài liệu: upload file mới qua `POST /{id}/upload-material` → lấy URL → truyền vào `MaterialUrl`
- Không ảnh hưởng đến các blocks hiện có
- Trả về 204 No Content khi thành công"
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> Update(
            Guid id,
            [FromBody] UpdateLessonRequestDto dto)
        {
            try
            {
                var command = new UpdateLessonCommand(id, dto);
                await _mediator.Send(command);
                return NoContent();
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI CẬP NHẬT BÀI HỌC] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, id, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // DELETE: api/teacher/lessons/{id}
        [HttpDelete("{id:guid}")]
        [SwaggerOperation(
            Summary = "GV - Xoá bài học",
            Description = @"
Xoá (soft delete) một bài học khỏi section.

**Lưu ý:**
- Đây là soft delete — bài học bị đánh dấu xóa, không xóa vật lý
- Tất cả blocks và FAQs thuộc bài học cũng bị xóa theo
- Không thể hoàn tác qua API; cần can thiệp DB nếu muốn khôi phục"
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _mediator.Send(new DeleteLessonCommand(id));
                return NoContent();
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI XOÁ BÀI HỌC] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, id, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // POST: api/teacher/lessons/{id}/upload-material
        [HttpPost("{id:guid}/upload-material")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "GV - Upload tài liệu bài học lên Cloudinary",
            Description = @"
Upload file tài liệu (video, PDF, DOCX, PPTX) cho bài học lên Cloudinary.

**Định dạng hỗ trợ:** MP4, PDF, DOCX, PPTX, DOC, PPT

**Giới hạn kích thước:** Tùy cấu hình Cloudinary (thường tối đa 100MB)

**Flow sử dụng:**
1. Gọi endpoint này để upload file → nhận `MaterialUrl` và `MaterialType`
2. Dùng `PUT /api/teacher/lessons/{id}` với `MaterialUrl` nhận được để gán tài liệu vào bài học

**Response trả về:**
- `MaterialUrl`: URL công khai trên Cloudinary
- `MaterialType`: loại tài liệu (MP4, PDF, DOCX, v.v.)
- `VideoType`: nếu là video thì trả về 'File', ngược lại null"
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> UploadMaterial(
            Guid id,
            IFormFile file,
            [FromServices] IFileStorageService fileStorageService,
            CancellationToken cancellationToken)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("File không hợp lệ.");

                using var stream = file.OpenReadStream();
                var uploadResult = await fileStorageService.UploadAsync(
                    stream,
                    file.FileName,
                    file.ContentType,
                    "lessons",
                    cancellationToken);

                return Ok(new
                {
                    MaterialUrl = uploadResult.FileUrl,
                    MaterialType = uploadResult.FileType,
                    VideoType = uploadResult.FileType == "MP4" ? "File" : null
                });
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI TẢI LÊN TÀI LIỆU BÀI HỌC] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Tên file: {FileName} | Kích thước: {FileSize} bytes | Loại file: {ContentType} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, id, file?.FileName, file?.Length, file?.ContentType, ex.GetType().Name, ex.Message);
                throw;
            }
        }
    }
}
