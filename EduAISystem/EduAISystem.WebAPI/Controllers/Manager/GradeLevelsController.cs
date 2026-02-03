using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.GradeLevels.Commands;
using EduAISystem.Application.Features.GradeLevels.DTOs.Request;
using EduAISystem.Application.Features.GradeLevels.DTOs.Response;
using EduAISystem.Application.Features.GradeLevels.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetGradeLevels([FromQuery] GetGradeLevelsQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<GradeLevelListResponseDto>>.Ok(result, "Lấy danh sách khối/lớp có phân trang"));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetGradeLevelById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetGradeLevelByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<GradeLevelDetailResponseDto?>.Fail("Không tìm thấy khối/lớp"));

            return Ok(ApiResponse<GradeLevelDetailResponseDto>.Ok(result, "Lấy chi tiết khối/lớp thành công"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateGradeLevel([FromBody] CreateGradeLevelRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateGradeLevelCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<GradeLevelDetailResponseDto>.Ok(result, "Tạo khối/lớp thành công"));
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateGradeLevel(Guid id, [FromBody] UpdateGradeLevelRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateGradeLevelCommand { Id = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<GradeLevelDetailResponseDto?>.Fail("Không tìm thấy khối/lớp"));

            return Ok(ApiResponse<GradeLevelDetailResponseDto>.Ok(result, "Cập nhật khối/lớp thành công"));
        }

        [HttpPatch("{id:guid}/status")]
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

