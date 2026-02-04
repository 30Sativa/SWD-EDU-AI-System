using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.CourseCategories.Commands;
using EduAISystem.Application.Features.CourseCategories.DTOs.Request;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using EduAISystem.Application.Features.CourseCategories.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

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
        [SwaggerOperation(
            Summary = "Danh sách danh mục khóa học",
            Description = "Lấy danh sách danh mục kèm phân trang và bộ lọc"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseCategoryListResponseDto>>))]
        public async Task<IActionResult> GetCourseCategories([FromQuery] GetCourseCategoriesQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<CourseCategoryListResponseDto>>.Ok(result, "Lấy danh sách danh mục khóa học có phân trang"));
        }

        [HttpGet("{id:guid}")]
        [SwaggerOperation(
            Summary = "Chi tiết danh mục",
            Description = "Lấy thông tin danh mục khóa học theo Id"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseCategoryDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<CourseCategoryDetailResponseDto?>))]
        public async Task<IActionResult> GetCourseCategoryById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetCourseCategoryByIdQuery { Id = id }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<CourseCategoryDetailResponseDto?>.Fail("Không tìm thấy danh mục khóa học"));

            return Ok(ApiResponse<CourseCategoryDetailResponseDto>.Ok(result, "Lấy chi tiết danh mục khóa học thành công"));
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "Tạo danh mục khóa học",
            Description = "Thêm mới danh mục khóa học với tên và trạng thái"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseCategoryDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CreateCourseCategory([FromBody] CreateCourseCategoryRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateCourseCategoryCommand { Request = dto }, cancellationToken);
            return Ok(ApiResponse<CourseCategoryDetailResponseDto>.Ok(result, "Tạo danh mục khóa học thành công"));
        }

        [HttpPut("{id:guid}")]
        [SwaggerOperation(
            Summary = "Cập nhật danh mục",
            Description = "Cập nhật tên/trạng thái danh mục khóa học"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseCategoryDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<CourseCategoryDetailResponseDto?>))]
        public async Task<IActionResult> UpdateCourseCategory(Guid id, [FromBody] UpdateCourseCategoryRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateCourseCategoryCommand { Id = id, Request = dto }, cancellationToken);
            if (result == null)
                return NotFound(ApiResponse<CourseCategoryDetailResponseDto?>.Fail("Không tìm thấy danh mục khóa học"));

            return Ok(ApiResponse<CourseCategoryDetailResponseDto>.Ok(result, "Cập nhật danh mục khóa học thành công"));
        }

        [HttpPatch("{id:guid}/status")]
        [SwaggerOperation(
            Summary = "Đổi trạng thái danh mục",
            Description = "Kích hoạt/Vô hiệu hóa danh mục khóa học"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
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

