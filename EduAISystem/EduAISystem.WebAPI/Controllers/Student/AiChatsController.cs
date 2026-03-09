using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.AiChat.DTOs.Request;
using EduAISystem.Application.Features.AiChat.DTOs.Response;
using EduAISystem.Application.Features.AiChat.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.WebAPI.Controllers.Student
{
    [Route("api/student/lessons/{lessonId:guid}/chat")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class AiChatsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AiChatsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Chat với AI về bài học cụ thể", Description = "Bot chỉ trả lời dựa trên nội dung bài học, không lan man.")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ChatWithLessonResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> ChatWithLesson(Guid lessonId, [FromBody] ChatWithLessonRequestDto request, CancellationToken cancellationToken)
        {
            try
            {
                var query = new ChatWithLessonQuery
                {
                    LessonId = lessonId,
                    Request = request
                };

                var result = await _mediator.Send(query, cancellationToken);
                return Ok(ApiResponse<ChatWithLessonResponseDto>.Ok(result, "Thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }
    }
}
