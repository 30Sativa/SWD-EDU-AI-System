using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using EduAISystem.Application.Features.Quiz.DTOs.Response;
using EduAISystem.Application.Features.Quiz.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/quizzes")]
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập, ICurrentUserService mới có User ID
    public class QuizzesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuditService _auditService;

        public QuizzesController(IMediator mediator, IAuditService auditService)
        {
            _mediator = mediator;
            _auditService = auditService;
        }

        // =============================================
        // 1. LẤY DANH SÁCH QUIZ
        // =============================================

        [HttpGet("lesson/{lessonId:guid}")]
        [SwaggerOperation(
            Summary = "HS - Danh sách quiz theo bài học",
            Description = "Học sinh xem danh sách tất cả quiz (formative) thuộc một bài học theo LessonId."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<QuizSummaryResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetByLessonId(Guid lessonId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetQuizzesByLessonQuery(lessonId), cancellationToken);
            return Ok(ApiResponse<List<QuizSummaryResponseDto>>.Ok(result));
        }

        [HttpGet("course/{courseId:guid}")]
        [SwaggerOperation(
            Summary = "HS - Danh sách quiz theo khóa học",
            Description = "Học sinh xem danh sách tất cả quiz (summative) thuộc một khóa học theo CourseId."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<QuizSummaryResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetByCourseId(Guid courseId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetQuizzesByCourseQuery(courseId), cancellationToken);
            return Ok(ApiResponse<List<QuizSummaryResponseDto>>.Ok(result));
        }

        // =============================================
        // 2. LẤY CHI TIẾT ĐỀ QUIZ ĐỂ LÀM BÀI
        // =============================================

        [HttpGet("{quizId:guid}")]
        [SwaggerOperation(
            Summary = "HS - Chi tiết đề quiz",
            Description = @"
Học sinh lấy toàn bộ nội dung đề quiz để bắt đầu làm bài.

**Bao gồm:**
- Thông tin tổng quát: tiêu đề, mô tả, thời gian làm bài, số câu hỏi
- Danh sách câu hỏi và các đáp án (chưa có đáp án đúng — chỉ trả về sau khi nộp bài)

**Luồng làm bài:**
1. `GET /{quizId}` — xem đề
2. `POST /{quizId}/attempts/start` — bắt đầu làm bài (tạo attempt)
3. `POST /attempts/{attemptId}/submit` — nộp bài
4. `GET /attempts/{attemptId}/result` — xem kết quả"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<QuizDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetQuizDetail(Guid quizId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetQuizDetailQuery(quizId), cancellationToken);
            return Ok(ApiResponse<QuizDetailResponseDto>.Ok(result));
        }

        // =============================================
        // 3. START & SUBMIT ATTEMPT
        // =============================================

        [HttpPost("{quizId:guid}/attempts/start")]
        [SwaggerOperation(
            Summary = "HS - Bắt đầu làm bài quiz",
            Description = @"
Tạo một lần làm bài mới (attempt) cho học sinh.

**Lưu ý:**
- Mỗi lần gọi endpoint này tạo ra một attempt mới
- Attempt sẽ ghi lại thời gian bắt đầu
- Số lần làm bài tối đa tùy thuộc cài đặt quiz (do giáo viên cấu hình)

**Response:** Trả về `AttemptId` — cần dùng cho bước nộp bài."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StartAttemptResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> StartAttempt(Guid quizId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new StartQuizAttemptCommand(quizId), cancellationToken);
            _auditService.LogAction("START_QUIZ", "Quiz", quizId, null, new { AttemptId = result.AttemptId });
            return Ok(ApiResponse<StartAttemptResponseDto>.Ok(result, "Bắt đầu làm bài thành công."));
        }

        [HttpPost("attempts/{attemptId:guid}/submit")]
        [SwaggerOperation(
            Summary = "HS - Nộp bài quiz",
            Description = @"
Học sinh nộp câu trả lời cho một attempt.

**Request body:**
- `Answers`: danh sách câu trả lời, mỗi phần tử gồm `QuestionId` và `SelectedOptionIndex`

**Response trả về:**
- Điểm số và số câu đúng/sai
- Kết quả từng câu (đúng/sai + đáp án đúng + giải thích)
- Thời gian hoàn thành

**Lưu ý:** Sau khi nộp, không thể sửa lại attempt này."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SubmitAttemptResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> SubmitAttempt(
            Guid attemptId,
            [FromBody] SubmitAttemptRequestDto dto,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new SubmitQuizAttemptCommand(attemptId, dto), cancellationToken);
            _auditService.LogAction("FINISH_QUIZ", "QuizAttempt", attemptId, null, new { Score = result.Score });
            return Ok(ApiResponse<SubmitAttemptResponseDto>.Ok(result, "Nộp bài thành công."));
        }

        // =============================================
        // 4. XEM KẾT QUẢ BÀI LÀM
        // =============================================

        [HttpGet("attempts/{attemptId:guid}/result")]
        [SwaggerOperation(
            Summary = "HS - Xem kết quả bài làm",
            Description = @"
Học sinh xem chi tiết kết quả của một lần làm bài (attempt).

**Bao gồm:**
- Điểm số và tỉ lệ % đúng
- Kết quả từng câu hỏi: đáp án học sinh chọn, đáp án đúng, giải thích
- Thời gian bắt đầu và thời gian nộp bài

**Lưu ý:** Chỉ xem được kết quả của attempt đã nộp (đã submit)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AttemptResultResponseDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetAttemptResult(Guid attemptId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAttemptResultQuery(attemptId), cancellationToken);
            return Ok(ApiResponse<AttemptResultResponseDto>.Ok(result));
        }
    }
}
