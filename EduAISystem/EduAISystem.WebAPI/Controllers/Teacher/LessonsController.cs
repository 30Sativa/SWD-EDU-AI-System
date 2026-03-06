using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Request;
using EduAISystem.Application.Features.Lessons.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace EduAISystem.WebAPI.Controllers.Teacher
{
    [Route("api/teacher/lessons")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<LessonsController> _logger;

        public LessonsController(IMediator mediator, ILogger<LessonsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
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
            try
            {
                var result = await _mediator.Send(new GetLessonByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI LẤY BÀI HỌC THEO ID] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, id, ex.GetType().Name, ex.Message);
                throw; // ném lại để GlobalExceptionMiddleware xử lý response
            }
        }

        // GET: api/teacher/lessons/by-section/{sectionId}
        [HttpGet("by-section/{sectionId:guid}")]
        public async Task<IActionResult> GetBySection(Guid sectionId)
        {
            try
            {
                var result = await _mediator.Send(new GetLessonsBySectionIdQuery(sectionId));
                return Ok(result);
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI LẤY DANH SÁCH BÀI HỌC THEO SECTION] MãTrace: {TraceId} | MãSection: {SectionId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, sectionId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // POST: api/teacher/lessons
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLessonRequestDto dto)
        {
            try
            {
                await _mediator.Send(new CreateLessonCommand(dto));
                return NoContent();
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI TẠO BÀI HỌC MỚI] MãTrace: {TraceId} | MãSection: {SectionId} | Tiêu đề: {Title} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, dto?.SectionId, dto?.Title, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // PUT: api/teacher/lessons/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(
            Guid id,
            [FromBody] UpdateLessonRequestDto dto)
        {
            try
            {
                var command = new UpdateLessonCommand(id, dto);
                await _mediator.Send(command);
                return NoContent();
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI CẬP NHẬT BÀI HỌC] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, id, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // DELETE: api/teacher/lessons/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _mediator.Send(new DeleteLessonCommand(id));
                return NoContent();
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI XOÁ BÀI HỌC] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, id, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        // POST: api/teacher/lessons/{id}/upload-material
        [HttpPost("{id:guid}/upload-material")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMaterial(
            Guid id,
            IFormFile file,
            [FromServices] IFileStorageService fileStorageService,
            CancellationToken cancellationToken)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("File không hợp lệ.");

                using var stream = file.OpenReadStream();
                var uploadResult = await fileStorageService.UploadAsync(
                    stream,
                    file.FileName,
                    file.ContentType,
                    "lessons",
                    cancellationToken);

                return Ok(new
                {
                    MaterialUrl = uploadResult.FileUrl,
                    MaterialType = uploadResult.FileType,
                    VideoType = uploadResult.FileType == "MP4" ? "File" : null
                });
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
                _logger.LogError(ex,
                    "[LỖI TẢI LÊN TÀI LIỆU BÀI HỌC] MãTrace: {TraceId} | MãBàiHọc: {LessonId} | Tên file: {FileName} | Kích thước: {FileSize} bytes | Loại file: {ContentType} | Loại lỗi: {ExType} | Chi tiết: {ExMsg}",
                    traceId, id, file?.FileName, file?.Length, file?.ContentType, ex.GetType().Name, ex.Message);
                throw;
            }
        }
    }
}

