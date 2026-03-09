using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Classes.Commands;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Application.Features.Classes.Queries;
using EduAISystem.Application.Features.Users.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/classes")]
    [ApiController]
    [Authorize(Roles = "Teacher")]
    public class TeacherClassesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUser;

        public TeacherClassesController(IMediator mediator, ICurrentUserService currentUser)
        {
            _mediator = mediator;
            _currentUser = currentUser;
        }

        [HttpGet("homeroom")]
        [SwaggerOperation(
            Summary = "GVCN - Danh sách lớp chủ nhiệm",
            Description = "Lấy danh sách các lớp mà giáo viên hiện tại đang làm Giáo viên Chủ nhiệm (GVCN)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<ClassListResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyClasses(CancellationToken cancellationToken)
        {
            var teacherId = _currentUser.UserId;
            var result = await _mediator.Send(new GetClassesByTeacherQuery { TeacherUserId = teacherId }, cancellationToken);
            return Ok(ApiResponse<List<ClassListResponseDto>>.Ok(result));
        }

        [HttpGet("{id:guid}/students")]
        [SwaggerOperation(
            Summary = "GVCN - Danh sách học sinh trong lớp",
            Description = "GVCN xem danh sách toàn bộ học sinh đang thuộc lớp mình chủ nhiệm. Chỉ GVCN của lớp mới có quyền xem."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<StudentInClassResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetStudents(Guid id, CancellationToken cancellationToken)
        {
            // Kiểm tra quyền chủ nhiệm
            if (!await IsHomeroomTeacher(id, cancellationToken))
                return Forbid();

            var result = await _mediator.Send(new GetStudentsInClassQuery { ClassId = id }, cancellationToken);
            return Ok(ApiResponse<List<StudentInClassResponseDto>>.Ok(result));
        }

        [HttpPost("{id:guid}/students")]
        [SwaggerOperation(
            Summary = "GVCN - Gán học sinh vào lớp",
            Description = "GVCN gán nhiều học sinh vào lớp chủ nhiệm cùng lúc bằng cách truyền danh sách StudentIds. Chỉ GVCN của lớp mới có quyền thực hiện."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> AddStudents(Guid id, [FromBody] List<Guid> studentIds, CancellationToken cancellationToken)
        {
            if (!await IsHomeroomTeacher(id, cancellationToken))
                return Forbid();

            var result = await _mediator.Send(new AddStudentsToClassCommand(id, studentIds), cancellationToken);
            return Ok(ApiResponse<object>.Ok(null, "Đã thêm học sinh vào lớp"));
        }

        [HttpDelete("{id:guid}/students/{studentId:guid}")]
        [SwaggerOperation(
            Summary = "GVCN - Xóa học sinh khỏi lớp",
            Description = "GVCN xóa một học sinh khỏi danh sách lớp chủ nhiệm. Học sinh sẽ không còn thuộc lớp này nhưng dữ liệu lịch sử (bài nộp, kết quả quiz) vẫn giữ nguyên."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> RemoveStudent(Guid id, Guid studentId, CancellationToken cancellationToken)
        {
            if (!await IsHomeroomTeacher(id, cancellationToken))
                return Forbid();

            var result = await _mediator.Send(new UnenrollStudentCommand(id, studentId), cancellationToken);
            return Ok(ApiResponse<object>.Ok(null, "Đã xóa học sinh khỏi lớp"));
        }

        [HttpPost("{id:guid}/students/import")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "GVCN - Import học sinh vào lớp bằng Excel",
            Description = @"
GVCN import danh sách học sinh vào lớp chủ nhiệm từ file Excel.

**Định dạng file Excel cần thiết:**
- Cột bắt buộc: `StudentCode` (mã học sinh) hoặc `Email`
- Học sinh phải đã có tài khoản trong hệ thống

**Kết quả trả về:** Số học sinh import thành công, danh sách lỗi (email không tìm thấy, đã ở trong lớp, v.v.)"
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ImportStudents(Guid id, IFormFile file)
        {
            if (!await IsHomeroomTeacher(id, CancellationToken.None))
                return Forbid();

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);

            var result = await _mediator.Send(new EnrollStudentsByExcelCommand(id, file.FileName, ms.ToArray()));
            return Ok(ApiResponse<object>.Ok(result, "Import hoàn tất"));
        }

        private async Task<bool> IsHomeroomTeacher(Guid classId, CancellationToken cancellationToken)
        {
            var classDetail = await _mediator.Send(new GetClassByIdQuery { Id = classId }, cancellationToken);
            return classDetail != null && classDetail.TeacherId == _currentUser.UserId;
        }

        [HttpGet("subject-assignments")]
        [SwaggerOperation(
            Summary = "Danh sách lớp GV được phân công bộ môn",
            Description = "Lấy danh sách tất cả các lớp mà giáo viên hiện tại được phân công dạy bộ môn (ClassSubjectTeachers)")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<TeacherClassSubjectResponseDto>>))]
        public async Task<IActionResult> GetMySubjectAssignments(CancellationToken cancellationToken)
        {
            var teacherId = _currentUser.UserId;
            var result = await _mediator.Send(new GetTeacherClassSubjectsQuery { TeacherId = teacherId }, cancellationToken);
            return Ok(ApiResponse<List<TeacherClassSubjectResponseDto>>.Ok(result, "Danh sách lớp được phân công dạy bộ môn"));
        }
    }
}
