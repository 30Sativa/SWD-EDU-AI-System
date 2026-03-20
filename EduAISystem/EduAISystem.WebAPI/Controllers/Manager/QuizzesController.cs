using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Quiz.DTOs.Response;
using EduAISystem.Application.Features.Quiz.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Diagnostics;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    [Route("api/manager/quizzes")]
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

        [HttpGet("questions-bank")]
        [SwaggerOperation(
            Summary = "Manager - Lấy danh sách Ngân hàng câu hỏi toàn hệ thống",
            Description = "Lấy danh sách các câu hỏi đã được tạo trên hệ thống. Manager có thể xem tất cả câu hỏi của các giáo viên."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<TeacherQuestionDetailResponseDto>>))]
        public async Task<IActionResult> GetQuestionBank(
            [FromQuery] Guid? courseId,
            [FromQuery] Guid? lessonId,
            CancellationToken cancellationToken)
        {
            try
            {
                var questions = await _mediator.Send(new GetTeacherQuestionBankQuery(courseId, lessonId), cancellationToken);
                return Ok(ApiResponse<List<TeacherQuestionDetailResponseDto>>.Ok(questions, "Lấy ngân hàng câu hỏi thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex, "Lỗi lấy Question Bank (Manager): {TraceId}", traceId);
                throw;
            }
        }

        [HttpGet("questions-bank/summary")]
        [SwaggerOperation(
            Summary = "Manager - Lấy thống kê Ngân hàng câu hỏi toàn hệ thống",
            Description = "Lấy dữ liệu tổng hợp ngân hàng câu hỏi của toàn bộ giáo viên, group theo môn học/bài học."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<QuestionBankSummaryResponseDto>>))]
        public async Task<IActionResult> GetQuestionBankSummary(CancellationToken cancellationToken)
        {
            try
            {
                // Manager không truyền TeacherId -> Lấy toàn bộ
                var summary = await _mediator.Send(new GetQuestionBankSummaryQuery(null), cancellationToken);
                return Ok(ApiResponse<List<QuestionBankSummaryResponseDto>>.Ok(summary, "Lấy thống kê ngân hàng thành công!"));
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex, "Lỗi lấy Question Bank Summary (Manager): {TraceId}", traceId);
                throw;
            }
        }
    }
}
