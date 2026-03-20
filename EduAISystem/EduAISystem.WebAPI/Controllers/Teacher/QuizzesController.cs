using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using EduAISystem.Application.Features.Quiz.DTOs.Response;
using EduAISystem.Application.Features.Quiz.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Diagnostics;
using System.Security.Claims;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/quizzes")]
    [ApiController]
    public class QuizzesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<QuizzesController> _logger;
        private readonly IAuditService _auditService;

        public QuizzesController(IMediator mediator, ILogger<QuizzesController> logger, IAuditService auditService)
        {
            _mediator = mediator;
            _logger = logger;
            _auditService = auditService;
        }

        [HttpPost("formative")]
        [SwaggerOperation(
            Summary = "GV - Tạo Formative Quiz (kiểm tra trong bài học)",
            Description = @"
Giáo viên tạo quiz đánh giá quá trình (formative) gắn với một bài học cụ thể.

**Formative Quiz:**
- Gắn với `LessonId` — học sinh làm sau khi học xong bài
- Mục đích: kiểm tra hiểu bài, không tính vào điểm tổng kết
- Học sinh có thể làm nhiều lần

**Sau khi tạo:** Dùng `POST /api/teacher/quizzes/{quizId}/questions` để thêm câu hỏi."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateFormativeQuiz(
            [FromBody] CreateFormativeQuizRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var quizId = await _mediator.Send(new CreateFormativeQuizCommand(dto), cancellationToken);
                _auditService.LogAction("CREATE_QUIZ", "Quiz", quizId, null, new { Type = "Formative", LessonId = dto.LessonId });
                return Ok(ApiResponse<Guid>.Ok(quizId, "Tạo formative quiz thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI TẠO FORMATIVE QUIZ] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, dto?.LessonId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPost("summative")]
        [SwaggerOperation(
            Summary = "GV - Tạo Summative Quiz (kiểm tra cuối khoá)",
            Description = @"
Giáo viên tạo quiz đánh giá tổng kết (summative) gắn với một khóa học.

**Summative Quiz:**
- Gắn với `CourseId` — học sinh làm sau khi hoàn thành toàn bộ khóa học
- Mục đích: kiểm tra tổng quát, có thể tính vào điểm tổng kết
- Thường chỉ làm 1 lần (tùy cấu hình)

**Sau khi tạo:** Dùng `POST /api/teacher/quizzes/{quizId}/questions` để thêm câu hỏi."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateSummativeQuiz(
            [FromBody] CreateSummativeQuizRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var quizId = await _mediator.Send(new CreateSummativeQuizCommand(dto), cancellationToken);
                _auditService.LogAction("CREATE_QUIZ", "Quiz", quizId, null, new { Type = "Summative", CourseId = dto.CourseId });
                return Ok(ApiResponse<Guid>.Ok(quizId, "Tạo summative quiz thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI TẠO SUMMATIVE QUIZ] MãTrace: {TraceId} | MãKhoáHọc: {CourseId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, dto?.CourseId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPost("{quizId:guid}/questions")]
        [SwaggerOperation(
            Summary = "GV - Thêm câu hỏi vào quiz",
            Description = @"
Thêm một câu hỏi trắc nghiệm mới vào quiz.

**Cấu trúc câu hỏi:**
- `QuestionText`: nội dung câu hỏi
- `Options`: danh sách đáp án (tối thiểu 2, tối đa 5)
- `CorrectOptionIndex`: index của đáp án đúng (0-based)
- `Explanation`: giải thích đáp án đúng (tùy chọn, hiển thị sau khi học sinh nộp bài)
- `SortOrder`: thứ tự hiển thị trong quiz"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> AddQuestion(
            Guid quizId,
            [FromBody] AddQuestionRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var questionId = await _mediator.Send(new AddQuestionToQuizCommand(quizId, dto), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(questionId, "Thêm câu hỏi vào quiz thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI THÊM CÂU HỎI VÀO QUIZ] MãTrace: {TraceId} | MãQuiz: {QuizId} | Nội dung câu hỏi: {QuestionText} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, quizId, dto?.QuestionText?[..Math.Min(dto.QuestionText.Length, 100)], ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpGet("{quizId:guid}/questions")]
        [SwaggerOperation(
            Summary = "GV - Lấy danh sách câu hỏi của quiz",
            Description = "Lấy đầy đủ danh sách câu hỏi trong một quiz bao gồm đáp án đúng và giải thích, phục vụ cho giao diện quản lý của giáo viên."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<TeacherQuestionDetailResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetQuestionsByQuiz(
            Guid quizId,
            CancellationToken cancellationToken)
        {
            try
            {
                var questions = await _mediator.Send(new GetTeacherQuestionsByQuizQuery(quizId), cancellationToken);
                return Ok(ApiResponse<List<TeacherQuestionDetailResponseDto>>.Ok(questions, "Lấy danh sách câu hỏi thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI LẤY DANH SÁCH CÂU HỎI] MãTrace: {TraceId} | MãQuiz: {QuizId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, quizId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPut("{quizId:guid}/attempt-settings")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật cài đặt số lần làm bài (attempt)",
            Description = @"
API riêng để chỉnh cài đặt liên quan đến số lần học sinh được làm quiz.

**Request body:**
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| maxAttempts | int? | Số lần làm bài tối đa |

**Ý nghĩa maxAttempts:**
| Giá trị | Ý nghĩa |
|---------|---------|
| **null** | Không giới hạn — học sinh làm vô hạn lần |
| **1** | Chỉ làm 1 lần duy nhất (phù hợp bài thi cuối khoá) |
| **3** | Tối đa 3 lần (ví dụ: formative quiz cho phép thử lại) |

**Ví dụ request:**
- Làm vô hạn lần: `{ ""maxAttempts"": null }`
- Chỉ 1 lần: `{ ""maxAttempts"": 1 }`
- Tối đa 5 lần: `{ ""maxAttempts"": 5 }`"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> UpdateAttemptSettings(
            Guid quizId,
            [FromBody] UpdateQuizAttemptSettingsRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var updatedId = await _mediator.Send(new UpdateQuizAttemptSettingsCommand(quizId, dto), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(updatedId, "Cập nhật cài đặt attempt thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI CẬP NHẬT ATTEMPT SETTINGS] MãTrace: {TraceId} | MãQuiz: {QuizId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, quizId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPut("{quizId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật thông tin quiz",
            Description = @"
Cập nhật tiêu đề, mô tả và cài đặt của quiz (thời gian làm bài, số lần làm tối đa, v.v.).

**Lưu ý:** Không cập nhật danh sách câu hỏi qua endpoint này. Dùng:
- `POST /{quizId}/questions` để thêm câu hỏi mới
- `PUT /{quizId}/questions/{questionId}` để sửa câu hỏi
- `DELETE /{quizId}/questions/{questionId}` để xóa câu hỏi
- `PUT /{quizId}/attempt-settings` để chỉnh riêng số lần làm bài"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> UpdateQuiz(
            Guid quizId,
            [FromBody] UpdateQuizRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var updatedId = await _mediator.Send(new UpdateQuizCommand(quizId, dto), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(updatedId, "Cập nhật quiz thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI CẬP NHẬT QUIZ] MãTrace: {TraceId} | MãQuiz: {QuizId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, quizId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpDelete("{quizId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Xoá quiz",
            Description = @"
Xoá một quiz khỏi khóa học/bài học.

**Lưu ý:**
- Xóa quiz sẽ xóa toàn bộ câu hỏi liên quan
- Nếu đã có học sinh làm bài, dữ liệu attempt có thể bị ảnh hưởng (tùy policy)
- Thao tác không thể hoàn tác"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> DeleteQuiz(
            Guid quizId,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(new DeleteQuizCommand(quizId), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(quizId, "Xoá quiz thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI XOÁ QUIZ] MãTrace: {TraceId} | MãQuiz: {QuizId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, quizId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPut("{quizId:guid}/questions/{questionId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật câu hỏi trong quiz (partial update)",
            Description = "Partial update: null, empty, whitespace = giữ nguyên. Các trường nullable: questionText, questionType, points, explanation, sortOrder, options. Options: null/[] = giữ nguyên; có dữ liệu = merge (update/add, không xóa). optionId có = cập nhật; null = thêm mới. Lỗi: QUIZ_NOT_FOUND(404), QUESTION_NOT_IN_QUIZ(404), QUESTION_TEXT_REQUIRED(400), QUESTION_TYPE_INVALID(400), QUESTION_POINTS_INVALID(400), OPTION_TEXT_REQUIRED(400), DB_UPDATE_CONCURRENCY(409)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateQuestion(
            Guid quizId,
            Guid questionId,
            [FromBody] UpdateQuestionRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(new UpdateQuestionInQuizCommand(quizId, questionId, dto), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(questionId, "Cập nhật câu hỏi thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI CẬP NHẬT CÂU HỎI TRONG QUIZ] MãTrace: {TraceId} | MãQuiz: {QuizId} | MãCâuHỏi: {QuestionId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, quizId, questionId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpGet("{quizId:guid}/questions/{questionId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Lấy chi tiết một câu hỏi trong quiz",
            Description = "Lấy đầy đủ thông tin câu hỏi (bao gồm options, đáp án đúng, giải thích) để hiển thị trong màn hình chỉnh sửa của giáo viên."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<TeacherQuestionDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetQuestionDetail(
            Guid quizId,
            Guid questionId,
            CancellationToken cancellationToken)
        {
            try
            {
                var question = await _mediator.Send(new GetTeacherQuestionDetailQuery(quizId, questionId), cancellationToken);
                return Ok(ApiResponse<TeacherQuestionDetailResponseDto>.Ok(question, "Lấy chi tiết câu hỏi thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI LẤY CHI TIẾT CÂU HỎI] MãTrace: {TraceId} | MãQuiz: {QuizId} | MãCâuHỏi: {QuestionId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, quizId, questionId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpDelete("{quizId:guid}/questions/{questionId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Xoá câu hỏi khỏi quiz",
            Description = @"
Xoá một câu hỏi cụ thể khỏi quiz.

**Lưu ý:**
- Các attempt đã có sẽ không bị ảnh hưởng (dữ liệu lịch sử vẫn giữ nguyên)
- SortOrder của các câu hỏi còn lại không tự động cập nhật — cần gọi update riêng nếu muốn sắp xếp lại"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> DeleteQuestion(
            Guid quizId,
            Guid questionId,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(new DeleteQuestionFromQuizCommand(quizId, questionId), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(questionId, "Xoá câu hỏi thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI XOÁ CÂU HỎI KHỎI QUIZ] MãTrace: {TraceId} | MãQuiz: {QuizId} | MãCâuHỏi: {QuestionId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, quizId, questionId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpGet("questions/{questionId:guid}/options")]
        [SwaggerOperation(
            Summary = "GV - Lấy danh sách options của câu hỏi",
            Description = "Lấy danh sách các lựa chọn (options) của một câu hỏi cụ thể, bao gồm thông tin IsCorrect để giáo viên xem/chỉnh sửa."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<OptionDetailResponseDto>>))]
        public async Task<IActionResult> GetQuestionOptions(
            Guid questionId,
            CancellationToken cancellationToken)
        {
            try
            {
                var options = await _mediator.Send(new GetQuestionOptionsQuery(questionId), cancellationToken);
                return Ok(ApiResponse<List<OptionDetailResponseDto>>.Ok(options, "Lấy danh sách options thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI LẤY QUESTION OPTIONS] MãTrace: {TraceId} | MãCâuHỏi: {QuestionId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, questionId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpPut("questions/{questionId:guid}/options/{optionId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật một option trong câu hỏi (partial update)",
            Description = "Partial update: null, empty, whitespace = giữ nguyên. Các trường nullable: optionText, isCorrect, sortOrder. Lỗi: OPTION_NOT_IN_QUESTION(404), OPTION_TEXT_REQUIRED(400), DB_UPDATE(400 - FK AttemptAnswers khi xóa option đã có học sinh chọn)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateQuestionOption(
            Guid questionId,
            Guid optionId,
            [FromBody] UpdateSingleOptionRequestDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(new UpdateQuestionOptionCommand(questionId, optionId, dto), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(optionId, "Cập nhật option thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI CẬP NHẬT QUESTION OPTION] MãTrace: {TraceId} | MãCâuHỏi: {QuestionId} | MãOption: {OptionId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, questionId, optionId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        [HttpDelete("questions/{questionId:guid}/options/{optionId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Xoá cứng một option khỏi câu hỏi",
            Description = "Xoá cứng hoàn toàn một option cụ thể khỏi câu hỏi. Thao tác không thể hoàn tác."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> DeleteQuestionOption(
            Guid questionId,
            Guid optionId,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(new DeleteQuestionOptionCommand(questionId, optionId), cancellationToken);
                return Ok(ApiResponse<Guid>.Ok(optionId, "Xoá option thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI XOÁ QUESTION OPTION] MãTrace: {TraceId} | MãCâuHỏi: {QuestionId} | MãOption: {OptionId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, questionId, optionId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // =============================================
        // FLOW 1: IMPORT FILE CÂU HỎI
        // =============================================
        [HttpPost("{quizId:guid}/import-file")]
        [SwaggerOperation(
            Summary = "GV - Import nhiều câu hỏi từ file (Excel, Word, PDF) bằng AI",
            Description = "API này tải file lên và kích hoạt background job đọc file. Trả về jobId, hãy dùng jobId này để tracking trên SignalR (kết nối tới /hubs/import, Lắng nghe các event: ReceiveProgress, ReceiveCompleted, ReceiveError với tham số truyền vào là group(jobId))."
        )]
        [ProducesResponseType(StatusCodes.Status202Accepted, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ImportFileQuestions(
            Guid quizId,
            IFormFile file,
            CancellationToken cancellationToken)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest(ApiResponse<object>.Fail("File is empty"));
                
                using var ms = new System.IO.MemoryStream();
                await file.CopyToAsync(ms, cancellationToken);
                var fileBytes = ms.ToArray();

                // Return 202 Accepted because it starts a background job
                var jobId = await _mediator.Send(new ImportQuestionsFromFileCommand(quizId, fileBytes, file.FileName, file.ContentType), cancellationToken);
                return Accepted(ApiResponse<Guid>.Ok(jobId, "Đã nhận file và bắt đầu xử lý import. Hãy tracking bằng SignalR với JobId."));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex, "Lỗi Import File: {TraceId}", traceId);
                throw;
            }
        }

        // =============================================
        // FLOW 2: QUESTION BANK ẢO
        // =============================================
        [HttpGet("questions-bank")]
        [SwaggerOperation(
            Summary = "GV - Lấy danh sách Ngân hàng câu hỏi",
            Description = "Lấy danh sách các câu hỏi cũ đã được tạo trên hệ thống để giáo viên tái sử dụng cho quiz mới."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<TeacherQuestionDetailResponseDto>>))]
        public async Task<IActionResult> GetTeacherQuestionBank(
            [FromQuery] Guid? courseId,
            [FromQuery] Guid? lessonId,
            CancellationToken cancellationToken)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                if (teacherId == null) return Unauthorized();

                var questions = await _mediator.Send(new GetTeacherQuestionBankQuery(courseId, lessonId, teacherId), cancellationToken);
                return Ok(ApiResponse<List<TeacherQuestionDetailResponseDto>>.Ok(questions, "Lấy ngân hàng câu hỏi thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex, "Lỗi lấy Question Bank: {TraceId}", traceId);
                throw;
            }
        }

        [HttpGet("questions-bank/summary")]
        [SwaggerOperation(
            Summary = "GV - Lấy thống kê Ngân hàng câu hỏi (theo Chủ đề/Bài học)",
            Description = "Lấy dữ liệu tổng hợp để hiển thị bảng thống kê ngân hàng câu hỏi, bao gồm số lượng câu hỏi, độ khó tóm tắt và thông tin môn học."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<QuestionBankSummaryResponseDto>>))]
        public async Task<IActionResult> GetTeacherQuestionBankSummary(CancellationToken cancellationToken)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                if (teacherId == null) return Unauthorized();

                var summary = await _mediator.Send(new GetQuestionBankSummaryQuery(teacherId.Value), cancellationToken);
                return Ok(ApiResponse<List<QuestionBankSummaryResponseDto>>.Ok(summary, "Lấy thống kê ngân hàng thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex, "Lỗi lấy Question Bank Summary: {TraceId}", traceId);
                throw;
            }
        }

        [HttpPost("{quizId:guid}/import-questions")]
        [SwaggerOperation(
            Summary = "GV - Clone câu hỏi từ Ngân hàng vào Quiz (Tái sử dụng)",
            Description = "Sao chép hoàn toàn (Clone) cấu trúc các câu hỏi cũ đưa vào một Quiz mới. Việc tạo clone đảm bảo khi GV thay đổi câu hỏi ở Quiz mới không ảnh hưởng tới Quiz cũ."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<Guid>>))]
        public async Task<IActionResult> CloneQuestionsFromBank(
            Guid quizId,
            [FromBody] List<Guid> sourceQuestionIds,
            CancellationToken cancellationToken)
        {
            try
            {
                if (sourceQuestionIds == null || !sourceQuestionIds.Any())
                {
                    return BadRequest(ApiResponse<object>.Fail("Hãy chọn ít nhất 1 câu hỏi để import."));
                }

                var newQuestionIds = await _mediator.Send(new CloneQuestionsFromBankCommand(quizId, sourceQuestionIds), cancellationToken);
                return Ok(ApiResponse<List<Guid>>.Ok(newQuestionIds, $"Clone thành công {newQuestionIds.Count} câu hỏi!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex, "Lỗi clone questions từ Bank: {TraceId}", traceId);
                throw;
            }
        }

        private Guid? GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userId, out var id) ? id : null;
        }
    }
}
