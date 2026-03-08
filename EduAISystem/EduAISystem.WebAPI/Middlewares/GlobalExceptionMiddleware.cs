using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Common.Models;
using EduAISystem.WebAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Text.Json;

namespace EduAISystem.WebAPI.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            IWebHostEnvironment env,
            ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _env = env;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Cho phép đọc lại body request để log khi có lỗi
            context.Request.EnableBuffering();

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

                // ── Thu thập thông tin chi tiết để log ──
                var method = context.Request.Method;
                var path = context.Request.Path + context.Request.QueryString;
                var user = context.User?.Identity?.Name ?? "chưa xác thực";
                var remoteIp = context.Connection.RemoteIpAddress?.ToString() ?? "không rõ";

                string requestBody = "";
                try
                {
                    context.Request.Body.Position = 0;
                    using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
                    requestBody = await reader.ReadToEndAsync();
                    if (requestBody.Length > 4000) // cắt bớt nếu body quá dài
                        requestBody = requestBody[..4000] + "...(đã cắt bớt)";
                }
                catch { /* không đọc được body */ }

                // ── Log có cấu trúc với đầy đủ ngữ cảnh ──
                _logger.LogError(ex,
                    "[LỖI CHƯA XỬ LÝ] MãTrace: {TraceId} | Phương thức: {Method} | Đường dẫn: {Path} | Người dùng: {User} | IP: {RemoteIp} | Loại lỗi: {ExceptionType} | Nội dung lỗi: {ExMessage} | Lỗi bên trong: {InnerException} | Nội dung request: {RequestBody}",
                    traceId,
                    method,
                    path,
                    user,
                    remoteIp,
                    ex.GetType().Name,
                    ex.Message,
                    ex.InnerException?.Message ?? "(không có)",
                    requestBody);

                context.Response.ContentType = "application/json";

                var statusCode = ex switch
                {
                    ValidationException => StatusCodes.Status400BadRequest,
                    BusinessException => StatusCodes.Status400BadRequest,
                    NotFoundException => StatusCodes.Status404NotFound,
                    KeyNotFoundException => StatusCodes.Status404NotFound,
                    ForbiddenException => StatusCodes.Status403Forbidden,
                    ConflictException => StatusCodes.Status409Conflict,
                    DbUpdateConcurrencyException => StatusCodes.Status409Conflict,
                    DbUpdateException => StatusCodes.Status400BadRequest,
                    _ => StatusCodes.Status500InternalServerError
                };

                context.Response.StatusCode = statusCode;

                var error = ex switch
                {
                    ValidationException ve => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = ve.Message,
                        Errors = ve.Errors,
                        TraceId = traceId
                    },

                    BusinessException be => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = be.Message,
                        ErrorCode = be.ErrorCode,
                        TraceId = traceId
                    },

                    NotFoundException ne => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = ne.Message,
                        ErrorCode = ne.ErrorCode,
                        TraceId = traceId
                    },

                    KeyNotFoundException kn => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = kn.Message,
                        TraceId = traceId
                    },

                    ConflictException ce => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = ce.Message,
                        TraceId = traceId
                    },

                    ForbiddenException fe => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = fe.Message,
                        TraceId = traceId
                    },

                    DbUpdateConcurrencyException dbEx => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = "Dữ liệu đã bị thay đổi hoặc xóa bởi thao tác khác. Vui lòng tải lại trang và thử lại.",
                        ErrorCode = "DB_UPDATE_CONCURRENCY",
                        Detail = dbEx.Message,
                        TraceId = traceId
                    },

                    DbUpdateException dbEx => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = ParseDbUpdateMessage(dbEx),
                        ErrorCode = "DB_UPDATE",
                        Detail = dbEx.InnerException?.Message ?? dbEx.Message,
                        TraceId = traceId
                    },

                    _ => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = _env.IsDevelopment()
                            ? (ex.InnerException?.Message ?? ex.Message)
                            : "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ kỹ thuật.",
                        Detail = _env.IsDevelopment()
                            ? ex.StackTrace
                            : $"Loại lỗi: {ex.GetType().Name} — Chi tiết: {ex.Message}",
                        TraceId = traceId
                    }
                };

                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
                };

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(error, jsonOptions));
            }
        }

        private static string ParseDbUpdateMessage(DbUpdateException ex)
        {
            var msg = ex.InnerException?.Message ?? ex.Message;
            if (msg.Contains("REFERENCE constraint", StringComparison.OrdinalIgnoreCase) ||
                msg.Contains("foreign key", StringComparison.OrdinalIgnoreCase))
            {
                if (msg.Contains("AttemptAnswers", StringComparison.OrdinalIgnoreCase) ||
                    msg.Contains("SelectedOptionId", StringComparison.OrdinalIgnoreCase))
                    return "Không thể thực hiện vì đã có học sinh chọn đáp án này trong bài làm. (Ràng buộc: AttemptAnswers.SelectedOptionId → QuestionOptions)";
                if (msg.Contains("QuestionId", StringComparison.OrdinalIgnoreCase))
                    return "Không thể thực hiện vì câu hỏi/đáp án đã được sử dụng trong bài làm của học sinh.";
            }
            if (msg.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                msg.Contains("duplicate key", StringComparison.OrdinalIgnoreCase))
                return "Trùng dữ liệu: ID đã tồn tại trong hệ thống.";
            return "Lỗi cập nhật cơ sở dữ liệu. Chi tiết: " + (msg.Length > 200 ? msg[..200] + "..." : msg);
        }
    }
}

