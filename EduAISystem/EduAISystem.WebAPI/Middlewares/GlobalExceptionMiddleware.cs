using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Common.Models;
using EduAISystem.WebAPI.Models;
using System.Diagnostics;
using System.Net;
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
                    NotFoundException => StatusCodes.Status404NotFound,
                    ForbiddenException => StatusCodes.Status403Forbidden,
                    ConflictException => StatusCodes.Status409Conflict,
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

                    NotFoundException ne => new ApiError
                    {
                        StatusCode = statusCode,
                        Message = ne.Message,
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
    }
}

