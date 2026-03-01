using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Common.Models;
using EduAISystem.WebAPI.Models;
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
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");

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
                        Message = ve.Message,
                        Errors = ve.Errors
                    },

                    NotFoundException ne => new ApiError
                    {
                        Message = ne.Message
                    },

                    ConflictException ce => new ApiError
                    {
                        Message = ce.Message
                    },

                    ForbiddenException fe => new ApiError
                    {
                        Message = fe.Message
                    },

                    _ => new ApiError
                    {
                        Message = _env.IsDevelopment()
                            ? (ex.InnerException?.Message ?? ex.Message)
                            : "Internal server error"
                    }
                };

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(error));
            }
        }
    }
}
