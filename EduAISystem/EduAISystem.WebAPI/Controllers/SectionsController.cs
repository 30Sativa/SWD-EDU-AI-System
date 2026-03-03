using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Sections.Commands;
using EduAISystem.Application.Features.Sections.DTOs.Request;
using EduAISystem.Application.Features.Sections.DTOs.Response;
using EduAISystem.Application.Features.Sections.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers
{
    [Route("api/courses/{courseId}/sections")]
    [ApiController]
    public class SectionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SectionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/courses/{courseId}/sections
        [HttpGet]
        [SwaggerOperation(
            Summary = "Lấy danh sách section của khóa học",
            Description = "Lấy toàn bộ section thuộc một khóa học theo CourseId"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<SectionResponseDto>>))]
        public async Task<IActionResult> GetSectionsByCourseAsync(Guid courseId)
        {
            var result = await _mediator.Send(
                new GetSectionsByCourseQuery(courseId)
            );

            return Ok(
                ApiResponse<List<SectionResponseDto>>.Ok(
                    result,
                    "Lấy danh sách section thành công"
                )
            );
        }

        // GET: api/courses/{courseId}/sections/{sectionId}
        [HttpGet("{sectionId:guid}")]
        [SwaggerOperation(
            Summary = "Lấy chi tiết section",
            Description = "Lấy thông tin chi tiết của một section theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SectionResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetSectionByIdAsync(Guid sectionId)
        {
            var result = await _mediator.Send(
                new GetSectionByIdQuery(sectionId)
            );

            return Ok(
                ApiResponse<SectionResponseDto>.Ok(
                    result,
                    "Lấy chi tiết section thành công"
                )
            );
        }

        // POST: api/courses/{courseId}/sections
        [HttpPost]
        [SwaggerOperation(
            Summary = "Tạo section cho khóa học",
            Description = "Thêm section mới vào khóa học hiện tại"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SectionResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateSectionAsync(Guid courseId,CreateSectionRequestDto request)
        {
            var result = await _mediator.Send(
                new CreateSectionCommand(courseId, request)
            );

            return Ok(
                ApiResponse<SectionResponseDto>.Ok(
                    result,
                    "Tạo section thành công"
                )
            );
        }

        // PUT: api/courses/{courseId}/sections/{sectionId}
        [HttpPut("{sectionId:guid}")]
        [SwaggerOperation(
            Summary = "Cập nhật section",
            Description = "Cập nhật tiêu đề/nội dung của section theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> UpdateSectionAsync(Guid sectionId,UpdateSectionRequestDto request)
        {
            await _mediator.Send(
                new UpdateSectionCommand(sectionId, request)
            );

            return NoContent(); // 204
        }

        // DELETE: api/courses/{courseId}/sections/{sectionId}
        [HttpDelete("{sectionId:guid}")]
        [SwaggerOperation(
            Summary = "Xoá section",
            Description = "Xoá (soft delete) một section khỏi khóa học"
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> DeleteSectionAsync(Guid sectionId)
        {
            await _mediator.Send(
                new DeleteSectionCommand(sectionId)
            );

            return NoContent();
        }
    }
}
