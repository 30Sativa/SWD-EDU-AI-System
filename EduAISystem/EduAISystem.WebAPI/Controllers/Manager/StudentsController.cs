using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Students.DTOs.Response;
using EduAISystem.Application.Features.Students.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    [Route("api/manager/students")]
    [ApiController]
    [Authorize(Roles = "Manager,Admin")]
    public class StudentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public StudentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Manager/Admin - Danh sách học sinh toàn trường",
            Description = "Tìm kiếm và lọc danh sách học sinh theo khối lớp, học kỳ, lớp hành chính, hoặc trạng thái hoạt động."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<StudentListResponseDto>>))]
        public async Task<IActionResult> GetStudents(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] Guid? gradeLevelId = null,
            [FromQuery] Guid? termId = null,
            [FromQuery] Guid? classId = null,
            [FromQuery] bool? isActiveFilter = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetStudentsQuery
            {
                Page = page,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                GradeLevelId = gradeLevelId,
                TermId = termId,
                ClassId = classId,
                IsActiveFilter = isActiveFilter
            }, cancellationToken);

            return Ok(ApiResponse<PagedResult<StudentListResponseDto>>.Ok(result, "Danh sách học sinh"));
        }
    }
}
