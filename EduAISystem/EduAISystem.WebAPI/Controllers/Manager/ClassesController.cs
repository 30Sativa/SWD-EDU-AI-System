using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Classes.Commands;
using EduAISystem.Application.Features.Classes.DTOs.Request;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Application.Features.Classes.Queries;
using EduAISystem.Application.Features.Users.Commands;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    [Route("api/manager/classes")]
    [ApiController]
    public class ClassesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ClassesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Danh sách lớp học",
            Description = "Lấy danh sách lớp học có phân trang + filter theo kỳ học/giáo viên/khối"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<ClassListResponseDto>>))]
        public async Task<IActionResult> GetClasses([FromQuery] GetClassesQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<ClassListResponseDto>>.Ok(result, "Lấy danh sách lớp học có phân trang"));
        }

        [HttpGet("{id:guid}")]
        [SwaggerOperation(
            Summary = "Chi tiết lớp học",
            Description = "Lấy thông tin lớp học theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ClassDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<ClassDetailResponseDto?>))]
        public async Task<IActionResult> GetClassById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetClassByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<ClassDetailResponseDto?>.Fail("Không tìm thấy lớp học"));

            return Ok(ApiResponse<ClassDetailResponseDto>.Ok(result, "Lấy chi tiết lớp học thành công"));
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "Tạo lớp học",
            Description = "Thêm mới lớp học"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ClassDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateClass([FromBody] CreateClassRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateClassCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<ClassDetailResponseDto>.Ok(result, "Tạo lớp học thành công"));
        }

        [HttpPut("{id:guid}")]
        [SwaggerOperation(
            Summary = "Cập nhật lớp học (bao gồm gán GVCN)",
            Description = "Cập nhật thông tin lớp học theo Id. Có thể thay đổi giáo viên chủ nhiệm qua field TeacherId nếu cần."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ClassDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<ClassDetailResponseDto?>))]
        public async Task<IActionResult> UpdateClass(Guid id, [FromBody] UpdateClassRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateClassCommand { Id = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<ClassDetailResponseDto?>.Fail("Không tìm thấy lớp học"));

            return Ok(ApiResponse<ClassDetailResponseDto>.Ok(result, "Cập nhật lớp học thành công"));
        }

        [HttpPatch("{id:guid}/status")]
        [SwaggerOperation(
            Summary = "Đổi trạng thái lớp học",
            Description = "Kích hoạt/Vô hiệu hóa lớp học"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> SetClassStatus(Guid id, [FromBody] SetClassStatusRequestDto dto, CancellationToken cancellationToken)
        {
            var updated = await _mediator.Send(new SetClassStatusCommand { Id = id, IsActive = dto.IsActive }, cancellationToken);
            if (!updated)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy lớp học"));

            var message = dto.IsActive ? "Đã kích hoạt lớp học" : "Đã vô hiệu hóa lớp học";
            return Ok(ApiResponse<object>.Ok(null, message));
        }

        [HttpDelete("{id:guid}")]
        [SwaggerOperation(
            Summary = "Xóa lớp học",
            Description = "Xóa lớp học (chỉ xóa được nếu không có học sinh và không bị gán vào khóa học)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> DeleteClass(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _mediator.Send(new DeleteClassCommand { Id = id }, cancellationToken);
            if (!deleted)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy lớp học"));

            return Ok(ApiResponse<object>.Ok(null, "Xóa lớp học thành công"));
        }

        [HttpPost("{id:guid}/subject-teachers")]
        [SwaggerOperation(Summary = "Phân công GV bộ môn", Description = "Gán giáo viên dạy môn học cụ thể cho lớp")]
        public async Task<IActionResult> AssignSubjectTeacher(Guid id, [FromBody] AssignSubjectTeacherRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new AssignSubjectTeacherCommand 
            { 
                ClassId = id, 
                SubjectId = dto.SubjectId, 
                TeacherId = dto.TeacherId 
            }, cancellationToken);

            return Ok(ApiResponse<object>.Ok(null, "Phân công giáo viên bộ môn thành công"));
        }
    }
}

