using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Request;
using EduAISystem.Application.Features.Lessons.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/lessons")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LessonsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/teacher/lessons
        [HttpGet]
        //public async Task<IActionResult> GetAll()
        //{
        //    var result = await _mediator.Send(new GetAllLessonsQuery());
        //    return Ok(result);
        //}

        // GET: api/teacher/lessons/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetLessonByIdQuery(id));
            return Ok(result);
        }

        // GET: api/teacher/lessons/by-section/{sectionId}
        //[HttpGet("by-section/{sectionId:guid}")]
        //public async Task<IActionResult> GetBySection(Guid sectionId)
        //{
        //    var result = await _mediator.Send(new GetLessonsBySectionIdQuery(sectionId));
        //    return Ok(result);
        //}

        // POST: api/teacher/lessons
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLessonRequestDto dto)
        {
            await _mediator.Send(new CreateLessonCommand(dto));
            return NoContent(); 
        }

        // PUT: api/teacher/lessons/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(
            Guid id,
            [FromBody] UpdateLessonRequestDto dto)
        {
            var command = new UpdateLessonCommand(id, dto);
            await _mediator.Send(command);

            return NoContent();
        }

        // DELETE: api/teacher/lessons/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _mediator.Send(new DeleteLessonCommand(id));
            return NoContent();
        }
    }
}
