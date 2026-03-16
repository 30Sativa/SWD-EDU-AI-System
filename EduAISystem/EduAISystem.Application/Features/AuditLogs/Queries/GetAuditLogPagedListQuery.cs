using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.AuditLogs.DTOs.Response;
using MediatR;
using System;

namespace EduAISystem.Application.Features.AuditLogs.Queries
{
    public class GetAuditLogPagedListQuery : IRequest<PagedResult<AuditLogResponseDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Action { get; set; }
        public string? Entity { get; set; }
        public Guid? UserId { get; set; }
    }
}
