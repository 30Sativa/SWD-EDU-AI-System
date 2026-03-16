using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Security;
using Microsoft.Extensions.Logging;
using Serilog.Context;
using System;
using System.Text.Json;

namespace EduAISystem.Infrastructure.Services.Logging
{
    public class AuditService : IAuditService
    {
        private readonly ILogger<AuditService> _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IClientContext _clientContext;

        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            WriteIndented = false,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        public AuditService(
            ILogger<AuditService> logger, 
            ICurrentUserService currentUserService, 
            IClientContext clientContext)
        {
            _logger = logger;
            _currentUserService = currentUserService;
            _clientContext = clientContext;
        }

        public void LogAction(string action, string entityName, Guid? entityId = null, object? oldValues = null, object? newValues = null)
        {
            if (!EduAISystem.Application.Common.Helpers.SystemFeaturesConfig.IsAuditLogEnabled)
                return;

            var userId = _currentUserService.UserId;
            
            // Nếu là hành động guest (như Login failed) thì UserId có thể là null
            var finalUserId = userId == Guid.Empty ? null : (Guid?)userId;

            using (LogContext.PushProperty("UserId", finalUserId))
            using (LogContext.PushProperty("Action", action))
            using (LogContext.PushProperty("Entity", entityName))
            using (LogContext.PushProperty("EntityId", entityId))
            using (LogContext.PushProperty("OldValues", oldValues != null ? JsonSerializer.Serialize(oldValues, JsonOptions) : null))
            using (LogContext.PushProperty("NewValues", newValues != null ? JsonSerializer.Serialize(newValues, JsonOptions) : null))
            using (LogContext.PushProperty("IpAddress", _clientContext.IpAddress))
            using (LogContext.PushProperty("UserAgent", _clientContext.UserAgent))
            {
                _logger.LogInformation("Audit Log: {Action} on {Entity} ({EntityId}) by User {UserId}", 
                    action, entityName, entityId, finalUserId);
            }
        }
    }
}
