using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Subjects.Commands;
using EduAISystem.Application.Features.Subjects.DTOs.Request;
using EduAISystem.Application.Features.Subjects.DTOs.Response;
using EduAISystem.Application.Features.Subjects.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    [Route("api/manager/subjects")]
    [ApiController]
    public class SubjectsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SubjectsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetSubjects([FromQuery] GetSubjectsQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<SubjectListResponseDto>>.Ok(result, "Lấy danh sách môn học có phân trang"));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetSubjectById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetSubjectByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<SubjectDetailResponseDto?>.Fail("Không tìm thấy môn học"));

            return Ok(ApiResponse<SubjectDetailResponseDto>.Ok(result, "Lấy chi tiết môn học thành công"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateSubjectCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<SubjectDetailResponseDto>.Ok(result, "Tạo môn học thành công"));
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] UpdateSubjectRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateSubjectCommand { Id = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<SubjectDetailResponseDto?>.Fail("Không tìm thấy môn học"));

            return Ok(ApiResponse<SubjectDetailResponseDto>.Ok(result, "Cập nhật môn học thành công"));
        }

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> SetSubjectStatus(Guid id, [FromBody] SetSubjectStatusRequestDto dto, CancellationToken cancellationToken)
        {
            var updated = await _mediator.Send(new SetSubjectStatusCommand { Id = id, IsActive = dto.IsActive }, cancellationToken);
            if (!updated)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy môn học"));

            var message = dto.IsActive ? "Đã kích hoạt môn học" : "Đã vô hiệu hóa môn học";
            return Ok(ApiResponse<object>.Ok(null, message));
        }
    }
}

