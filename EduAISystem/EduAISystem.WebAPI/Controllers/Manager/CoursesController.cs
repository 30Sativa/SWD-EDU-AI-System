using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Request;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using EduAISystem.WebAPI.Models.Requests;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    [Route("api/manager/courses")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CoursesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ===== CREATE TEMPLATE =====
        [HttpPost("template")]
        [SwaggerOperation(
            Summary = "Manager - Tạo template khóa học",
            Description = @"
Tạo một template (khung nội dung chuẩn) cho khóa học.

**Template là gì?**
- Template là khung chương trình chuẩn do Manager/Admin thiết kế.
- Giáo viên chỉ cần clone template → tùy chỉnh nội dung cụ thể.
- Template không gán cho lớp học, không có học sinh.

**Sau khi tạo template:**
1. Dùng `POST /api/manager/courses/{id}/scan` để upload file chương trình học → AI phân tích cấu trúc.
2. Dùng `POST /api/manager/courses/{id}/save-structure` để lưu cấu trúc đã phân tích.
3. Giáo viên dùng `POST /api/teacher/courses/clone` để clone template."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateTemplate(
            [FromBody] CreateTemplateCourseRequestDto dto,
            CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(new CreateTemplateCourseCommand(dto),
                cancellationToken);

            return Ok(ApiResponse<Guid>
                .Ok(id, "Tạo template thành công"));
        }

        // ===== AI SCAN =====
        [HttpPost("{id:guid}/scan")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Manager - AI phân tích file chương trình học",
            Description = @"
Upload file chương trình học (PDF/DOCX) để AI tự động phân tích và đề xuất cấu trúc sections & lessons.

**Định dạng file hỗ trợ:** PDF, DOCX, DOC

**Luồng sử dụng:**
1. `POST /template` → tạo template
2. **`POST /{id}/scan`** (endpoint này) → upload file, AI trả về cấu trúc đề xuất
3. `POST /{id}/save-structure` → xác nhận và lưu cấu trúc

**Kết quả trả về:**
- Danh sách sections với tiêu đề và thứ tự
- Danh sách lessons trong mỗi section (tiêu đề, mô tả ngắn, thứ tự)
- Teacher review kết quả trước khi lưu chính thức."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ScanTemplateCourseResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> ScanTemplate(Guid id, [FromForm] ScanTemplateUploadRequest request, CancellationToken cancellationToken)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(ApiResponse<object>.Fail("File không hợp lệ"));

            using var ms = new MemoryStream();
            await request.File.CopyToAsync(ms, cancellationToken);

            var result = await _mediator.Send(
                new ScanTemplateCourseCommand(
                    id,
                    ms.ToArray(),
                    request.File.FileName,
                    request.File.ContentType),
                cancellationToken);

            return Ok(ApiResponse<ScanTemplateCourseResponseDto>
                .Ok(result, "AI phân tích thành công"));
        }

        // ===== SAVE STRUCTURE =====
        [HttpPost("{id:guid}/save-structure")]
        [SwaggerOperation(
            Summary = "Manager - Lưu cấu trúc sections & lessons vào template",
            Description = @"
Lưu chính thức cấu trúc sections và lessons (đã qua review) vào template.

**Khi nào dùng?**
- Sau khi AI scan và trả về cấu trúc đề xuất
- Manager đã review, chỉnh sửa cấu trúc trên giao diện
- Gọi endpoint này để persit vào database

**Lưu ý:**
- Ghi đè toàn bộ cấu trúc cũ của template (nếu đã có)
- Danh sách sections phải có ít nhất 1 phần tử"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> SaveStructure(
            Guid id,
            [FromBody] List<SectionScanDto> sections,
            CancellationToken cancellationToken)
        {
            if (sections == null || !sections.Any())
                return BadRequest(ApiResponse<object>.Fail("Danh sách section trống"));

            await _mediator.Send(
                new SaveScannedTemplateStructureCommand(id, sections),
                cancellationToken);

            return Ok(ApiResponse<object>.Ok(null, "Lưu cấu trúc thành công"));
        }

        // ===== GET TEMPLATE LIST =====
        [HttpGet("templates")]
        [SwaggerOperation(
            Summary = "Manager - Danh sách template khóa học",
            Description = @"
Lấy danh sách tất cả template khóa học với phân trang và filter.

**Template** là khung chương trình chuẩn do Manager thiết kế để giáo viên clone.

**Query params:**
- `page` / `pageSize`: phân trang (mặc định 1 / 10)
- `searchTerm`: tìm theo tên template
- `isActive`: lọc theo trạng thái (true/false)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseListItemResponseDto>>))]
        public async Task<IActionResult> GetTemplates(
            [FromQuery] GetCoursesQuery query,
            CancellationToken cancellationToken)
        {
            query.IsTemplate = true;

            var result = await _mediator.Send(query, cancellationToken);

            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>
                .Ok(result, "Danh sách template"));
        }
    }
}
