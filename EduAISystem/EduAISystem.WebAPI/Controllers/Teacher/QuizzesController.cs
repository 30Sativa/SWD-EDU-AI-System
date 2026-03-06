using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using MediatR;
using Microsoft.AspNetCore.Mvc;
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

