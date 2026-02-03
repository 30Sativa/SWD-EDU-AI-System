using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.CourseCategories.Commands;
using EduAISystem.Application.Features.CourseCategories.DTOs.Request;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using EduAISystem.Application.Features.CourseCategories.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    [Route("api/manager/course-categories")]
    [ApiController]
    public class CourseCategoriesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CourseCategoriesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetCourseCategories([FromQuery] GetCourseCategoriesQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<CourseCategoryListResponseDto>>.Ok(result, "Lấy danh sách danh mục khóa học có phân trang"));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetCourseCategoryById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetCourseCategoryByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<CourseCategoryDetailResponseDto?>.Fail("Không tìm thấy danh mục khóa học"));

            return Ok(ApiResponse<CourseCategoryDetailResponseDto>.Ok(result, "Lấy chi tiết danh mục khóa học thành công"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateCourseCategory([FromBody] CreateCourseCategoryRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateCourseCategoryCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<CourseCategoryDetailResponseDto>.Ok(result, "Tạo danh mục khóa học thành công"));
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateCourseCategory(Guid id, [FromBody] UpdateCourseCategoryRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateCourseCategoryCommand { Id = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<CourseCategoryDetailResponseDto?>.Fail("Không tìm thấy danh mục khóa học"));

            return Ok(ApiResponse<CourseCategoryDetailResponseDto>.Ok(result, "Cập nhật danh mục khóa học thành công"));
        }

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> SetCourseCategoryStatus(Guid id, [FromBody] SetCourseCategoryStatusRequestDto dto, CancellationToken cancellationToken)
        {
            var updated = await _mediator.Send(new SetCourseCategoryStatusCommand { Id = id, IsActive = dto.IsActive }, cancellationToken);
            if (!updated)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy danh mục khóa học"));

            var message = dto.IsActive ? "Đã kích hoạt danh mục khóa học" : "Đã vô hiệu hóa danh mục khóa học";
            return Ok(ApiResponse<object>.Ok(null, message));
        }
    }
}

