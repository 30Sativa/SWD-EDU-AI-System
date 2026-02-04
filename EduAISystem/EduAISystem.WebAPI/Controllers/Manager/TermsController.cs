using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Terms.Commands;
using EduAISystem.Application.Features.Terms.DTOs.Request;
using EduAISystem.Application.Features.Terms.DTOs.Response;
using EduAISystem.Application.Features.Terms.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    [Route("api/manager/terms")]
    [ApiController]
    public class TermsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TermsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Danh sách kỳ học",
            Description = "Lấy danh sách kỳ học có phân trang"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<TermListResponseDto>>))]
        public async Task<IActionResult> GetTerms([FromQuery] GetTermsQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<TermListResponseDto>>.Ok(result, "Lấy danh sách kỳ học có phân trang"));
        }

        [HttpGet("{id:guid}")]
        [SwaggerOperation(
            Summary = "Chi tiết kỳ học",
            Description = "Lấy thông tin kỳ học theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<TermDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<TermDetailResponseDto?>))]
        public async Task<IActionResult> GetTermById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetTermByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<TermDetailResponseDto?>.Fail("Không tìm thấy kỳ học"));

            return Ok(ApiResponse<TermDetailResponseDto>.Ok(result, "Lấy chi tiết kỳ học thành công"));
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "Tạo kỳ học",
            Description = "Thêm mới kỳ học"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<TermDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateTerm([FromBody] CreateTermRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateTermCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<TermDetailResponseDto>.Ok(result, "Tạo kỳ học thành công"));
        }

        [HttpPut("{id:guid}")]
        [SwaggerOperation(
            Summary = "Cập nhật kỳ học",
            Description = "Cập nhật thông tin kỳ học theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<TermDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<TermDetailResponseDto?>))]
        public async Task<IActionResult> UpdateTerm(Guid id, [FromBody] UpdateTermRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateTermCommand { Id = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<TermDetailResponseDto?>.Fail("Không tìm thấy kỳ học"));

            return Ok(ApiResponse<TermDetailResponseDto>.Ok(result, "Cập nhật kỳ học thành công"));
        }

        [HttpPatch("{id:guid}/status")]
        [SwaggerOperation(
            Summary = "Đổi trạng thái kỳ học",
            Description = "Kích hoạt/Vô hiệu hóa kỳ học"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> SetTermStatus(Guid id, [FromBody] SetTermStatusRequestDto dto, CancellationToken cancellationToken)
        {
            var updated = await _mediator.Send(new SetTermStatusCommand { Id = id, IsActive = dto.IsActive }, cancellationToken);
            if (!updated)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy kỳ học"));

            var message = dto.IsActive ? "Đã kích hoạt kỳ học" : "Đã vô hiệu hóa kỳ học";
            return Ok(ApiResponse<object>.Ok(null, message));
        }

        [HttpDelete("{id:guid}")]
        [SwaggerOperation(
            Summary = "Xóa kỳ học",
            Description = "Xóa kỳ học (chỉ xóa được nếu không có lớp học thuộc kỳ học)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> DeleteTerm(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _mediator.Send(new DeleteTermCommand { Id = id }, cancellationToken);
            if (!deleted)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy kỳ học"));

            return Ok(ApiResponse<object>.Ok(null, "Xóa kỳ học thành công"));
        }
    }
}

