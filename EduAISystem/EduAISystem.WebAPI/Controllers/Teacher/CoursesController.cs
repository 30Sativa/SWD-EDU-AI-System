using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Request;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using EduAISystem.Application.Features.Courses.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/courses")]
    [ApiController]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuditService _auditService;

        public CoursesController(IMediator mediator, IAuditService auditService)
        {
            _mediator = mediator;
            _auditService = auditService;
        }

        [HttpGet("{id:guid}")]
        [SwaggerOperation(
            Summary = "GV - Chi tiết khóa học",
            Description = "Giáo viên xem thông tin chi tiết của một khóa học theo Id (bao gồm sections, lessons, trạng thái publish)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetCourseById(
            Guid id,
            CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            var course = await _mediator.Send(new GetCourseByIdQuery
            {
                Id = id
            }, cancellationToken);

            if (course == null)
                return NotFound();

            return Ok(ApiResponse<CourseDetailResponseDto>
                .Ok(course, "Chi tiết khóa học"));
        }

        [HttpGet("my")]
        [SwaggerOperation(
            Summary = "GV - Danh sách khóa học của tôi",
            Description = @"
Lấy danh sách tất cả khóa học mà giáo viên hiện tại đang quản lý, kèm phân trang.

**Chỉ trả về khóa học** mà `TeacherId = {currentUser}`.

**Query params:**
- `page` / `pageSize`: phân trang (mặc định 1 / 10)
- `searchTerm`: tìm theo tên khóa học
- `status`: lọc theo trạng thái (`Draft`, `Published`)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseListItemResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyCourses(
            [FromQuery] GetMyCoursesQuery query,
            CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            query.TeacherId = teacherId.Value;

            var result = await _mediator.Send(query, cancellationToken);

            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>
                .Ok(result, "Danh sách khóa học của tôi"));
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "GV - Tạo khóa học mới",
            Description = @"
Giáo viên tạo một khóa học mới từ đầu (không clone từ template).

**Trạng thái ban đầu:** `Draft` — khóa học chưa được publish, học sinh chưa thấy.

**Sau khi tạo:**
1. Thêm sections qua `POST /api/courses/{courseId}/sections`
2. Thêm lessons vào mỗi section
3. Publish qua `POST /api/teacher/courses/{id}/publish`"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseDetailResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateCourse(
            [FromBody] CreateCourseRequestDto dto,
            CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            var result = await _mediator.Send(new CreateCourseCommand
            {
                TeacherId = teacherId.Value,
                Request = dto
            }, cancellationToken);

            _auditService.LogAction("CREATE_COURSE", "Course", result.Id, null, dto);

            return Ok(ApiResponse<CourseDetailResponseDto>
                .Ok(result, "Tạo khóa học thành công"));
        }

        [HttpPut("{id:guid}")]
        [SwaggerOperation(
            Summary = "GV - Cập nhật thông tin khóa học",
            Description = @"
Giáo viên cập nhật tiêu đề, mô tả, ảnh thumbnail và metadata của khóa học.

**Quyền hạn:** Chỉ giáo viên sở hữu khóa học mới được cập nhật.

**Lưu ý:** Không thể cập nhật khóa học đã bị khóa (locked). Không thay đổi trạng thái publish qua endpoint này — dùng `/publish` hoặc `/unpublish`."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> UpdateCourse(
            Guid id,
            [FromBody] UpdateCourseRequestDto dto,
            CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            await _mediator.Send(new UpdateCourseCommand(id, teacherId.Value, dto), cancellationToken);

            return Ok(ApiResponse<object>.Ok(null, "Cập nhật khóa học thành công"));
        }

        [HttpPost("{id:guid}/publish")]
        [SwaggerOperation(
            Summary = "GV - Publish khóa học",
            Description = @"
Chuyển khóa học từ trạng thái `Draft` sang `Published`.

**Điều kiện publish:**
- Khóa học phải có ít nhất 1 section và 1 lesson
- Các trường bắt buộc phải được điền đầy đủ

**Sau khi publish:** Học sinh được gán vào lớp liên kết với khóa học sẽ thấy khóa học.

**Hoàn tác:** Dùng `/unpublish` để chuyển về Draft."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> PublishCourse(
            Guid id,
            CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            await _mediator.Send(new PublishCourseCommand
            {
                CourseId = id,
                TeacherId = teacherId.Value
            }, cancellationToken);

            _auditService.LogAction("PUBLISH_COURSE", "Course", id);

            return Ok(ApiResponse<object>.Ok(null, "Publish thành công"));
        }

        [HttpGet("templates")]
        [SwaggerOperation(
            Summary = "GV - Danh sách template khóa học",
            Description = "Giáo viên xem các template có sẵn (do Manager tạo) để clone thành khóa học cá nhân."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CourseListItemResponseDto>>))]
        public async Task<IActionResult> GetTemplates([FromQuery] GetCoursesQuery query, CancellationToken cancellationToken)
        {
            query.IsTemplate = true;
            query.IsActive = true;
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<PagedResult<CourseListItemResponseDto>>.Ok(result));
        }

        private Guid? GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userId, out var id) ? id : null;
        }

        [HttpPost("clone")]
        [SwaggerOperation(
            Summary = "GV - Clone khóa học từ template",
            Description = @"
Tạo khóa học cá nhân bằng cách clone từ một template có sẵn.

**Lợi ích:**
- Thừa kế toàn bộ cấu trúc sections/lessons từ template
- Giáo viên chỉ cần tùy chỉnh nội dung cụ thể cho từng bài học
- Tiết kiệm thời gian tạo chương trình học

**Sau khi clone:**
- Tạo một bản sao chép riêng biệt, độc lập với template gốc
- Trạng thái: `Draft`
- Giáo viên tự chỉnh sửa nội dung và publish"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<Guid>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> CloneFromTemplate([FromBody] CloneTemplateCourseRequestDto dto, CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            var id = await _mediator.Send(
                new CloneTemplateCourseCommand(dto),
                cancellationToken);

            return Ok(ApiResponse<Guid>
                .Ok(id, "Clone khóa học thành công"));
        }

        [HttpPost("{id:guid}/classes/{classId:guid}")]
        [SwaggerOperation(
            Summary = "GV - Gán lớp học vào khóa học",
            Description = @"
Giáo viên gán một lớp học vào khóa học để học sinh trong lớp đó có thể truy cập khóa học.

**Điều kiện:**
- Giáo viên phải được phân công dạy bộ môn của lớp đó (`ClassSubjectTeachers`)
- Lớp học phải đang active

**Sau khi gán:** Học sinh trong lớp sẽ thấy khóa học trong danh sách khóa học của mình."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> AssignClass(Guid id, Guid classId, CancellationToken cancellationToken)
        {
            var teacherId = GetCurrentUserId();
            if (teacherId == null)
                return Unauthorized();

            var result = await _mediator.Send(new AssignClassToCourseCommand
            {
                CourseId = id,
                ClassId = classId,
                TeacherId = teacherId.Value
            }, cancellationToken);

            return Ok(ApiResponse<object>.Ok(null, "Gán lớp thành công."));
        }
    }
}
