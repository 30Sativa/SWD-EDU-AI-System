using EduAISystem.Application.Common.Helpers;
using EduAISystem.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Admin
{
    [Route("api/admin/settings")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SystemSettingsController : ControllerBase
    {
        [HttpPut("system-notifications")]
        [SwaggerOperation(
            Summary = "Admin - Bật/Tắt thông báo hệ thống",
            Description = "Bật hoặc tắt các thông báo tự động từ hệ thống (khi có bài tập, bài học mới, ...)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
        public IActionResult ToggleSystemNotifications([FromQuery] bool enabled)
        {
            SystemFeaturesConfig.IsEventNotificationEnabled = enabled;
            var statusStr = enabled ? "Bật" : "Tắt";
            return Ok(ApiResponse<bool>.Ok(enabled, $"Đã {statusStr} thông báo hệ thống tự động."));
        }

        [HttpPut("audit-logs")]
        [SwaggerOperation(
            Summary = "Admin - Bật/Tắt Audit Logs",
            Description = "Bật hoặc tắt chức năng ghi log hành động của người dùng (Audit Logs)."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
        public IActionResult ToggleAuditLogs([FromQuery] bool enabled)
        {
            SystemFeaturesConfig.IsAuditLogEnabled = enabled;
            var statusStr = enabled ? "Bật" : "Tắt";
            return Ok(ApiResponse<bool>.Ok(enabled, $"Đã {statusStr} tính năng ghi Audit Log."));
        }
        
        [HttpGet("status")]
        [SwaggerOperation(
            Summary = "Admin - Xem trạng thái các tính năng hệ thống",
            Description = "Xem trạng thái hiện tại của System Notifications và Audit Logs."
        )]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        public IActionResult GetSystemSettingsStatus()
        {
            return Ok(ApiResponse<object>.Ok(new 
            {
                IsEventNotificationEnabled = SystemFeaturesConfig.IsEventNotificationEnabled,
                IsAuditLogEnabled = SystemFeaturesConfig.IsAuditLogEnabled
            }, "Lấy trạng thái cấu hình hệ thống thành công."));
        }
    }
}
