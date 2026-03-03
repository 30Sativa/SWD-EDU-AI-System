using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/quizzes")]
    [ApiController]
    public class QuizzesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public QuizzesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("formative")]
        public async Task<IActionResult> CreateFormativeQuiz(
            [FromBody] CreateFormativeQuizRequestDto dto,
            CancellationToken cancellationToken)
        {
            var quizId = await _mediator.Send(new CreateFormativeQuizCommand(dto), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(quizId, "Tạo formative quiz thành công!"));
        }

        [HttpPost("summative")]
        public async Task<IActionResult> CreateSummativeQuiz(
            [FromBody] CreateSummativeQuizRequestDto dto,
            CancellationToken cancellationToken)
        {
            var quizId = await _mediator.Send(new CreateSummativeQuizCommand(dto), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(quizId, "Tạo summative quiz thành công!"));
        }

        [HttpPost("{quizId:guid}/questions")]
        public async Task<IActionResult> AddQuestion(
            Guid quizId,
            [FromBody] AddQuestionRequestDto dto,
            CancellationToken cancellationToken)
        {
            var questionId = await _mediator.Send(new AddQuestionToQuizCommand(quizId, dto), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(questionId, "Thêm câu hỏi vào quiz thành công!"));
        }

        [HttpPut("{quizId:guid}")]
        public async Task<IActionResult> UpdateQuiz(
            Guid quizId,
            [FromBody] UpdateQuizRequestDto dto,
            CancellationToken cancellationToken)
        {
            var updatedId = await _mediator.Send(new UpdateQuizCommand(quizId, dto), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(updatedId, "Cập nhật quiz thành công!"));
        }

        [HttpDelete("{quizId:guid}")]
        public async Task<IActionResult> DeleteQuiz(
            Guid quizId,
            CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteQuizCommand(quizId), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(quizId, "Xoá quiz thành công!"));
        }

        [HttpPut("{quizId:guid}/questions/{questionId:guid}")]
        public async Task<IActionResult> UpdateQuestion(
            Guid quizId,
            Guid questionId,
            [FromBody] UpdateQuestionRequestDto dto,
            CancellationToken cancellationToken)
        {
            await _mediator.Send(new UpdateQuestionInQuizCommand(quizId, questionId, dto), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(questionId, "Cập nhật câu hỏi thành công!"));
        }

        [HttpDelete("{quizId:guid}/questions/{questionId:guid}")]
        public async Task<IActionResult> DeleteQuestion(
            Guid quizId,
            Guid questionId,
            CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteQuestionFromQuizCommand(quizId, questionId), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(questionId, "Xoá câu hỏi thành công!"));
        }
    }
}
