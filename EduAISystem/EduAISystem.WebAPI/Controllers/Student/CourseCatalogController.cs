using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.CourseCategories.DTOs.Response;
using EduAISystem.Application.Features.CourseCategories.Queries;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Student
{
    /// <summary>
    /// Public catalog: học sinh/student duyệt danh mục và khóa học công khai.
    /// Không yêu cầu role cụ thể, chỉ cần đăng nhập (Authorize từ global policy).
    /// </summary>
    [Route("api/catalog")]
    [ApiController]
    public class CourseCatalogController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CourseCatalogController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ===========================
        // DANH MỤC KHÓA HỌC (PUBLIC)
        // ===========================
        [HttpGet("categories")]
        [SwaggerOperation(
            Summary = "Danh mục khóa học công khai",
            Description = "Trả về danh sách danh mục (category) đang active. Hỗ trợ filter theo parentId để lấy sub-category."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseCategoryListResponseDto>>))]
        public async Task<IActionResult> GetCategories(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? searchTerm = null,
            [FromQuery] Guid? parentId = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetCourseCategoriesQuery
            {
                Page = page,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                IsActiveFilter = true, // Chỉ lấy active
                ParentId = parentId
            }, cancellationToken);

            return Ok(ApiResponse<PagedResult<CourseCategoryListResponseDto>>
                .Ok(result, "Danh mục khóa học"));
        }

        // ===========================
        // COURSE CATALOG (PUBLIC)
        // ===========================
        [HttpGet("courses")]
        [SwaggerOperation(
            Summary = "Danh sách khóa học công khai",
            Description = "Tìm kiếm + lọc khóa học đã publish. Filter theo: môn (subjectId), khối (gradeLevelId), kỳ học (termId), danh mục (categoryId)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseListItemResponseDto>>))]
        public async Task<IActionResult> GetCourses(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] Guid? categoryId = null,
            [FromQuery] Guid? subjectId = null,
            [FromQuery] Guid? gradeLevelId = null,
            [FromQuery] Guid? termId = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetPublicCoursesQuery
            {
                Page = page,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                CategoryId = categoryId,
                SubjectId = subjectId,
                GradeLevelId = gradeLevelId,
                TermId = termId
            }, cancellationToken);

            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>
                .Ok(result, "Danh sách khóa học"));
        }

        // ===========================
        // COURSE THEO CATEGORY
        // ===========================
        [HttpGet("categories/{categoryId:guid}/courses")]
        [SwaggerOperation(
            Summary = "Khóa học theo danh mục",
            Description = "Lấy danh sách khóa học thuộc một danh mục cụ thể."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseListItemResponseDto>>))]
        public async Task<IActionResult> GetCoursesByCategory(
            Guid categoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetPublicCoursesQuery
            {
                Page = page,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                CategoryId = categoryId
            }, cancellationToken);

            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>
                .Ok(result, $"Khóa học theo danh mục"));
        }

        // ===========================
        // CHI TIẾT COURSE (PUBLIC)
        // ===========================
        [HttpGet("courses/{id:guid}")]
        [SwaggerOperation(
            Summary = "Chi tiết khóa học công khai",
            Description = "Xem chi tiết một khóa học đã publish."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCourseDetail(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var course = await _mediator.Send(new GetCourseByIdQuery { Id = id }, cancellationToken);

            if (course == null)
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy khóa học"));

            return Ok(ApiResponse<CourseDetailResponseDto>.Ok(course, "Chi tiết khóa học"));
        }
    }
}
