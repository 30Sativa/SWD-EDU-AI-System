using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.AuditLogs.DTOs.Response;
using EduAISystem.Application.Features.AuditLogs.Queries;
using EduAISystem.Domain.Entities;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.AuditLogs.Handlers
{
    public class AuditLogQueryHandlers : 
        IRequestHandler<GetAuditLogPagedListQuery, PagedResult<AuditLogResponseDto>>,
        IRequestHandler<GetRecentAuditLogsQuery, List<AuditLogResponseDto>>
    {
        private readonly IAuditLogRepository _auditLogRepository;

        public AuditLogQueryHandlers(IAuditLogRepository auditLogRepository)
        {
            _auditLogRepository = auditLogRepository;
        }

        public async Task<PagedResult<AuditLogResponseDto>> Handle(GetAuditLogPagedListQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _auditLogRepository.GetPagedListAsync(
                request.PageNumber,
                request.PageSize,
                request.Action,
                request.Entity,
                request.UserId,
                cancellationToken);

            var dtos = items.Select(MapToDto).ToList();

            return new PagedResult<AuditLogResponseDto> 
            { 
                Items = dtos, 
                TotalCount = totalCount, 
                Page = request.PageNumber, 
                PageSize = request.PageSize 
            };
        }

        public async Task<List<AuditLogResponseDto>> Handle(GetRecentAuditLogsQuery request, CancellationToken cancellationToken)
        {
            var items = await _auditLogRepository.GetRecentAsync(request.Count, cancellationToken);
            return items.Select(MapToDto).ToList();
        }

        private AuditLogResponseDto MapToDto(AuditLogDomain domain)
        {
            return new AuditLogResponseDto
            {
                Id = domain.Id,
                UserId = domain.UserId,
                UserEmail = domain.UserEmail,
                Action = domain.Action,
                Entity = domain.Entity,
                EntityId = domain.EntityId,
                OldValues = domain.OldValues,
                NewValues = domain.NewValues,
                IpAddress = domain.IpAddress,
                UserAgent = domain.UserAgent,
                CreatedAt = domain.CreatedAt
            };
        }
    }
}
