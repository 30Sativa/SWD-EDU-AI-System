using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Diagnostics;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/quizzes")]
    [ApiController]
    public class QuizzesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<QuizzesController> _logger;

        public QuizzesController(IMediator mediator, ILogger<QuizzesController> logger)
        {
            _mediator = mediator;
            _logger = logger;
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

        [HttpPut("{quizId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật thông tin quiz",
            Description = @"
Cập nhật tiêu đề, mô tả và cài đặt của quiz (thời gian làm bài, số lần làm tối đa, v.v.).

**Lưu ý:** Không cập nhật danh sách câu hỏi qua endpoint này. Dùng:
- `POST /{quizId}/questions` để thêm câu hỏi mới
- `PUT /{quizId}/questions/{questionId}` để sửa câu hỏi
- `DELETE /{quizId}/questions/{questionId}` để xóa câu hỏi"
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
            Summary = "GV - Cập nhật câu hỏi trong quiz",
            Description = @"
Cập nhật nội dung câu hỏi, các đáp án, đáp án đúng và giải thích trong quiz.

**Các trường có thể cập nhật:**
- `QuestionText`: nội dung câu hỏi
- `Options`: toàn bộ danh sách đáp án (ghi đè)
- `CorrectOptionIndex`: index đáp án đúng mới
- `Explanation`: giải thích đáp án đúng
- `SortOrder`: thứ tự hiển thị"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
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
    }
}
