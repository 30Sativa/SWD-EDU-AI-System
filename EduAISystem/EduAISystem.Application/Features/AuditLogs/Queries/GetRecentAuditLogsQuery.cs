using EduAISystem.Application.Features.AuditLogs.DTOs.Response;
using MediatR;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.AuditLogs.Queries
{
    public class GetRecentAuditLogsQuery : IRequest<List<AuditLogResponseDto>>
    {
        public int Count { get; set; } = 5;
    }
}
