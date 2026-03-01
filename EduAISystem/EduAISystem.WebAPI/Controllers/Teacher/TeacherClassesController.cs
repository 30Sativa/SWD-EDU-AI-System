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
        [SwaggerOperation(Summary = "Danh sách lớp chủ nhiệm", Description = "Lấy các lớp mà giáo viên hiện tại là GVCN")]
        public async Task<IActionResult> GetMyClasses(CancellationToken cancellationToken)
        {
            var teacherId = _currentUser.UserId;
            var result = await _mediator.Send(new GetClassesByTeacherQuery { TeacherUserId = teacherId }, cancellationToken);
            return Ok(ApiResponse<List<ClassListResponseDto>>.Ok(result));
        }

        [HttpGet("{id:guid}/students")]
        [SwaggerOperation(Summary = "Danh sách học sinh trong lớp chủ nhiệm")]
        public async Task<IActionResult> GetStudents(Guid id, CancellationToken cancellationToken)
        {
            // Kiểm tra quyền chủ nhiệm
            if (!await IsHomeroomTeacher(id, cancellationToken))
                return Forbid();

            var result = await _mediator.Send(new GetStudentsInClassQuery { ClassId = id }, cancellationToken);
            return Ok(ApiResponse<List<StudentInClassResponseDto>>.Ok(result));
        }

        [HttpPost("{id:guid}/students")]
        [SwaggerOperation(Summary = "GVCN gán học sinh vào lớp")]
        public async Task<IActionResult> AddStudents(Guid id, [FromBody] List<Guid> studentIds, CancellationToken cancellationToken)
        {
            if (!await IsHomeroomTeacher(id, cancellationToken))
                return Forbid();

            var result = await _mediator.Send(new AddStudentsToClassCommand(id, studentIds), cancellationToken);
            return Ok(ApiResponse<object>.Ok(null, "Đã thêm học sinh vào lớp"));
        }

        [HttpDelete("{id:guid}/students/{studentId:guid}")]
        [SwaggerOperation(Summary = "GVCN xóa học sinh khỏi lớp")]
        public async Task<IActionResult> RemoveStudent(Guid id, Guid studentId, CancellationToken cancellationToken)
        {
            if (!await IsHomeroomTeacher(id, cancellationToken))
                return Forbid();

            var result = await _mediator.Send(new UnenrollStudentCommand(id, studentId), cancellationToken);
            return Ok(ApiResponse<object>.Ok(null, "Đã xóa học sinh khỏi lớp"));
        }

        [HttpPost("{id:guid}/students/import")]
        [SwaggerOperation(Summary = "GVCN import học sinh cũ vào lớp bằng excel")]
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
    }
}
