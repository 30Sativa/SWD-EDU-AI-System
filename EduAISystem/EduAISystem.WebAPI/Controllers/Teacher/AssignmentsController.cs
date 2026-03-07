using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Assignments.Commands;
using EduAISystem.Application.Features.Assignments.DTOs.Request;
using EduAISystem.Application.Features.Assignments.DTOs.Response;
using EduAISystem.Application.Features.Assignments.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Diagnostics;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/assignments")]
    [ApiController]
    public class AssignmentsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AssignmentsController> _logger;

        public AssignmentsController(IMediator mediator, ILogger<AssignmentsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "GV - Tạo bài tập cho khóa học",
            Description = "Giáo viên tạo assignment gắn với một course, có thể chọn publish ngay"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Create(
            [FromBody] CreateAssignmentRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var id = await _mediator.Send(new CreateAssignmentCommand(dto), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(id, "Tạo bài tập thành công."));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI TẠO BÀI TẬP] MãTrace: {TraceId} | MãKhoáHọc: {CourseId} | Tiêu đề: {Title} | Publish: {Publish} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, dto?.CourseId, dto?.Title, dto?.Publish, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPut("{assignmentId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật bài tập",
            Description = "Giáo viên cập nhật tiêu đề, mô tả, hạn nộp, điểm tối đa của assignment"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Update(
            Guid assignmentId,
            [FromBody] UpdateAssignmentRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var id = await _mediator.Send(new UpdateAssignmentCommand(assignmentId, dto), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(id, "Cập nhật bài tập thành công."));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI CẬP NHẬT BÀI TẬP] MãTrace: {TraceId} | MãBàiTập: {AssignmentId} | Tiêu đề mới: {Title} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, assignmentId, dto?.Title, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpDelete("{assignmentId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Xoá bài tập",
            Description = "Giáo viên xoá assignment khỏi course (cân nhắc policy khi đã có submission)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Delete(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(new DeleteAssignmentCommand(assignmentId), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(assignmentId, "Xoá bài tập thành công."));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI XOÁ BÀI TẬP] MãTrace: {TraceId} | MãBàiTập: {AssignmentId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, assignmentId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPost("{assignmentId:guid}/publish")]
        [SwaggerOperation(
            Summary = "GV - Publish bài tập",
            Description = "Giáo viên publish assignment để học sinh nhìn thấy và nộp bài"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Publish(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            try
            {
                var id = await _mediator.Send(new PublishAssignmentCommand(assignmentId), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(id, "Xuất bản bài tập thành công."));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI XUẤT BẢN BÀI TẬP] MãTrace: {TraceId} | MãBàiTập: {AssignmentId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, assignmentId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPost("{assignmentId:guid}/unpublish")]
        [SwaggerOperation(
            Summary = "GV - Unpublish bài tập",
            Description = "Giáo viên ẩn assignment (chuyển về Draft), học sinh mới sẽ không thấy"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Unpublish(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            try
            {
                var id = await _mediator.Send(new UnpublishAssignmentCommand(assignmentId), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(id, "Ẩn bài tập thành công."));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI ẨN BÀI TẬP] MãTrace: {TraceId} | MãBàiTập: {AssignmentId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, assignmentId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpGet("course/{courseId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Danh sách bài tập theo khóa học",
            Description = "Giáo viên xem tất cả assignment (Draft/Published) của một course"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<AssignmentSummaryResponseDto>>))]
        public async Task<IActionResult> GetByCourse(
            Guid courseId,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _mediator.Send(
                    new GetAssignmentsByCourseForTeacherQuery(courseId),
                    cancellationToken);

                return Ok(ApiResponse<List<AssignmentSummaryResponseDto>>.Ok(result, "Lấy danh sách bài tập thành công."));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI LẤY DANH SÁCH BÀI TẬP THEO KHOÁ HỌC] MãTrace: {TraceId} | MãKhoáHọc: {CourseId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, courseId, ex.GetType().Name, ex.Message);
                throw;
            }
        }
    }
}


