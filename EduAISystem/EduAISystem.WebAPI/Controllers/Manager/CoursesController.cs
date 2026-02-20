using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Request;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using EduAISystem.WebAPI.Models.Requests;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> ScanTemplate( Guid id, [FromForm] ScanTemplateUploadRequest request, CancellationToken cancellationToken)
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
