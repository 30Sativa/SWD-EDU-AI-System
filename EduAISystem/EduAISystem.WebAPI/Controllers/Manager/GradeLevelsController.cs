using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.GradeLevels.Commands;
using EduAISystem.Application.Features.GradeLevels.DTOs.Request;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using EduAISystem.Application.Features.GradeLevels.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    [Route("api/manager/grade-levels")]
    [ApiController]
    public class GradeLevelsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GradeLevelsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Danh sách khối/lớp",
            Description = "Lấy danh sách khối/lớp có phân trang"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<GradeLevelListResponseDto>>))]
        public async Task<IActionResult> GetGradeLevels([FromQuery] GetGradeLevelsQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<GradeLevelListResponseDto>>.Ok(result, "Lấy danh sách khối/lớp có phân trang"));
        }

        [HttpGet("{id:guid}")]
        [SwaggerOperation(
            Summary = "Chi tiết khối/lớp",
            Description = "Lấy thông tin khối/lớp theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<GradeLevelDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<GradeLevelDetailResponseDto?>))]
        public async Task<IActionResult> GetGradeLevelById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetGradeLevelByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<GradeLevelDetailResponseDto?>.Fail("Không tìm thấy khối/lớp"));

            return Ok(ApiResponse<GradeLevelDetailResponseDto>.Ok(result, "Lấy chi tiết khối/lớp thành công"));
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "Tạo khối/lớp",
            Description = "Thêm mới khối/lớp với thông tin cơ bản"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<GradeLevelDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateGradeLevel([FromBody] CreateGradeLevelRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateGradeLevelCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<GradeLevelDetailResponseDto>.Ok(result, "Tạo khối/lớp thành công"));
        }

        [HttpPut("{id:guid}")]
        [SwaggerOperation(
            Summary = "Cập nhật khối/lớp",
            Description = "Cập nhật thông tin khối/lớp theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<GradeLevelDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<GradeLevelDetailResponseDto?>))]
        public async Task<IActionResult> UpdateGradeLevel(Guid id, [FromBody] UpdateGradeLevelRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateGradeLevelCommand { Id = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<GradeLevelDetailResponseDto?>.Fail("Không tìm thấy khối/lớp"));

            return Ok(ApiResponse<GradeLevelDetailResponseDto>.Ok(result, "Cập nhật khối/lớp thành công"));
        }

        [HttpPatch("{id:guid}/status")]
        [SwaggerOperation(
            Summary = "Đổi trạng thái khối/lớp",
            Description = "Kích hoạt/Vô hiệu hóa khối/lớp"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> SetGradeLevelStatus(Guid id, [FromBody] SetGradeLevelStatusRequestDto dto, CancellationToken cancellationToken)
        {
            var updated = await _mediator.Send(new SetGradeLevelStatusCommand { Id = id, IsActive = dto.IsActive }, cancellationToken);
            if (!updated)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy khối/lớp"));

            var message = dto.IsActive ? "Đã kích hoạt khối/lớp" : "Đã vô hiệu hóa khối/lớp";
            return Ok(ApiResponse<object>.Ok(null, message));
        }
    }
}

