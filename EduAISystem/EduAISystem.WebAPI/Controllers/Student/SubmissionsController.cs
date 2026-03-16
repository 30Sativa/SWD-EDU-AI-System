using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Submissions.Commands;
using EduAISystem.Application.Features.Submissions.DTOs.Request;
using EduAISystem.Application.Features.Submissions.DTOs.Response;
using EduAISystem.Application.Features.Submissions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/submissions")]
    [ApiController]
    [Authorize]
    public class SubmissionsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuditService _auditService;

        public SubmissionsController(IMediator mediator, IAuditService auditService)
        {
            _mediator = mediator;
            _auditService = auditService;
        }

        [HttpPost("assignment/{assignmentId:guid}")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "HS - Nộp bài assignment",
            Description = "Học sinh nộp bài (text và/hoặc file upload) cho một assignment; nếu đã có bài trước đó thì sẽ ghi nhận lần nộp mới nhất. FE nên dùng cấu hình từ API assignments (AllowedFileTypes, MaxFileSizeMB, AllowTextSubmit, AllowFileSubmit) để validate loại file, dung lượng và cho phép kiểu nộp phù hợp."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        public async Task<IActionResult> Submit(
            Guid assignmentId,
            [FromForm] string? content,
            IFormFile? file,
            [FromServices] IFileStorageService fileStorageService,
            CancellationToken cancellationToken)
        {
            string? fileUrl = null;
            string? fileName = null;
            long? fileSize = null;
            string? fileType = null;

            if (file != null && file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadResult = await fileStorageService.UploadAsync(
                    stream,
                    file.FileName,
                    file.ContentType,
                    "submissions",
                    cancellationToken);

                fileUrl = uploadResult.FileUrl;
                fileName = uploadResult.FileName;
                fileSize = uploadResult.FileSizeBytes;
                fileType = uploadResult.FileType;
            }

            var dto = new SubmitAssignmentRequestDto(content, fileUrl, fileName, fileSize, fileType);

            var id = await _mediator.Send(
                new SubmitAssignmentCommand(assignmentId, dto),
                cancellationToken);

            _auditService.LogAction("SUBMIT_ASSIGNMENT", "Assignment", assignmentId, null, new { SubmissionId = id });

            return Ok(ApiResponse<Guid>.Ok(id, "Nộp bài thành công."));
        }

        [HttpGet("assignment/{assignmentId:guid}/me")]
        [SwaggerOperation(
            Summary = "HS - Xem bài nộp của mình",
            Description = "Học sinh xem lại bài nộp mới nhất + điểm/feedback (nếu đã được chấm)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SubmissionSummaryResponseDto?>))]
        public async Task<IActionResult> GetMySubmission(
            Guid assignmentId,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetMySubmissionForAssignmentQuery(assignmentId),
                cancellationToken);

            return Ok(ApiResponse<SubmissionSummaryResponseDto?>.Ok(result));
        }
    }
}

