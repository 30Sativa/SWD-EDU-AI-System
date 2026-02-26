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

        [HttpPost]
        public async Task<IActionResult> CreateQuiz(
            [FromBody] CreateQuizRequestDto dto,
            CancellationToken cancellationToken)
        {
            var quizId = await _mediator.Send(new CreateQuizCommand(dto), cancellationToken);
            return Ok(ApiResponse<Guid>.Ok(quizId, "Tạo quiz thành công!"));
        }

    }
}
