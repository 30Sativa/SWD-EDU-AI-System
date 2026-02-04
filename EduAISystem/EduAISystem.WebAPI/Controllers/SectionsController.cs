using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Sections.Commands;
using EduAISystem.Application.Features.Sections.DTOs.Request;
using EduAISystem.Application.Features.Sections.DTOs.Response;
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

        [HttpPut("{sectionId}")]
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
    }
}
