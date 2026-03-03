using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using EduAISystem.Application.Features.Quiz.DTOs.Response;
using EduAISystem.Application.Features.Quiz.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/quizzes")]
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập, ICurrentUserService mới có User ID
    public class QuizzesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public QuizzesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // =============================================
        // 1. LẤY DANH SÁCH QUIZ
        // =============================================

        [HttpGet("lesson/{lessonId:guid}")]
        public async Task<IActionResult> GetByLessonId(Guid lessonId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetQuizzesByLessonQuery(lessonId), cancellationToken);
            return Ok(ApiResponse<List<QuizSummaryResponseDto>>.Ok(result));
        }

        [HttpGet("course/{courseId:guid}")]
        public async Task<IActionResult> GetByCourseId(Guid courseId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetQuizzesByCourseQuery(courseId), cancellationToken);
            return Ok(ApiResponse<List<QuizSummaryResponseDto>>.Ok(result));
        }

        // =============================================
        // 2. LẤY CHI TIẾT ĐỀ QUIZ ĐỂ LÀM BÀI
        // =============================================

        [HttpGet("{quizId:guid}")]
        public async Task<IActionResult> GetQuizDetail(Guid quizId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetQuizDetailQuery(quizId), cancellationToken);
            return Ok(ApiResponse<QuizDetailResponseDto>.Ok(result));
        }

        // =============================================
        // 3. START & SUBMIT ATTEMPT
        // =============================================

        [HttpPost("{quizId:guid}/attempts/start")]
        public async Task<IActionResult> StartAttempt(Guid quizId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new StartQuizAttemptCommand(quizId), cancellationToken);
            return Ok(ApiResponse<StartAttemptResponseDto>.Ok(result, "Bắt đầu làm bài thành công."));
        }

        [HttpPost("attempts/{attemptId:guid}/submit")]
        public async Task<IActionResult> SubmitAttempt(
            Guid attemptId,
            [FromBody] SubmitAttemptRequestDto dto,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new SubmitQuizAttemptCommand(attemptId, dto), cancellationToken);
            return Ok(ApiResponse<SubmitAttemptResponseDto>.Ok(result, "Nộp bài thành công."));
        }

        // =============================================
        // 4. XEM KẾT QUẢ BÀI LÀM
        // =============================================

        [HttpGet("attempts/{attemptId:guid}/result")]
        public async Task<IActionResult> GetAttemptResult(Guid attemptId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAttemptResultQuery(attemptId), cancellationToken);
            return Ok(ApiResponse<AttemptResultResponseDto>.Ok(result));
        }
    }
}
