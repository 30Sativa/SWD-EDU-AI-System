using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.AiAnalytics.DTOs.Response;
using EduAISystem.Application.Features.AiAnalytics.Queries;
using MediatR;

namespace EduAISystem.Application.Features.AiAnalytics.Handler
{
    // ===== Handler 1: Dashboard tổng quan =====
    public class GetAiDashboardQueryHandler : IRequestHandler<GetAiDashboardQuery, AiDashboardResponseDto>
    {
        private readonly IAilogRepository _ailogRepository;

        private static readonly Dictionary<string, string> FeatureDisplayNames = new()
        {
            { "GenerateLessonBlocks",       "Sinh nội dung bài học (EduVN AI)" },
            { "GenerateLessonBlocksStream", "Sinh nội dung streaming (EduVN AI)" },
            { "ScanTemplateCourse",         "Phân tích cấu trúc khoá học (AI)" }
        };

        public GetAiDashboardQueryHandler(IAilogRepository ailogRepository)
        {
            _ailogRepository = ailogRepository;
        }

        public async Task<AiDashboardResponseDto> Handle(GetAiDashboardQuery request, CancellationToken cancellationToken)
        {
            var dateTo   = request.To   ?? DateTime.UtcNow;
            var dateFrom = request.From ?? dateTo.AddDays(-30);

            var totalCalls  = await _ailogRepository.GetTotalCallsAsync(dateFrom, dateTo, cancellationToken);
            var totalTokens = await _ailogRepository.GetTotalTokensAsync(dateFrom, dateTo, cancellationToken);
            var totalCost   = await _ailogRepository.GetTotalCostAsync(dateFrom, dateTo, cancellationToken);
            var byFeature   = await _ailogRepository.GetStatsByFeatureAsync(dateFrom, dateTo, cancellationToken);
            var daily       = await _ailogRepository.GetDailyStatsAsync(dateFrom, dateTo, cancellationToken);

            return new AiDashboardResponseDto
            {
                From             = dateFrom,
                To               = dateTo,
                TotalCalls       = totalCalls,
                TotalTokens      = totalTokens,
                TotalCostUsd     = totalCost,
                AvgCostPerCall   = totalCalls > 0 ? Math.Round(totalCost / totalCalls, 6) : 0,
                AvgTokensPerCall = totalCalls > 0 ? Math.Round((decimal)totalTokens / totalCalls, 1) : 0,

                ByFeature = byFeature.Select(f => new AiFeatureStatsResponseDto
                {
                    Feature            = f.Feature,
                    FeatureDisplayName = FeatureDisplayNames.GetValueOrDefault(f.Feature, f.Feature),
                    TotalCalls         = f.TotalCalls,
                    TotalTokens        = f.TotalTokens,
                    TotalCostUsd       = f.TotalCost,
                    AvgTokensPerCall   = Math.Round(f.AvgTokensPerCall, 1),
                    PercentOfTotalCalls = totalCalls > 0
                        ? Math.Round((decimal)f.TotalCalls / totalCalls * 100, 1)
                        : 0
                }).ToList(),

                DailyStats = daily.Select(d => new AiDailyStatsResponseDto
                {
                    Date         = d.Date.ToString("yyyy-MM-dd"),
                    TotalCalls   = d.TotalCalls,
                    TotalTokens  = d.TotalTokens,
                    TotalCostUsd = d.TotalCost
                }).ToList()
            };
        }
    }

    // ===== Handler 2: Summary cards =====
    public class GetAiSummaryQueryHandler : IRequestHandler<GetAiSummaryQuery, AiSummaryResponseDto>
    {
        private readonly IAilogRepository _ailogRepository;

        public GetAiSummaryQueryHandler(IAilogRepository ailogRepository)
        {
            _ailogRepository = ailogRepository;
        }

        public async Task<AiSummaryResponseDto> Handle(GetAiSummaryQuery request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            // Tháng này
            var thisMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var thisCalls  = await _ailogRepository.GetTotalCallsAsync(thisMonthStart, now, cancellationToken);
            var thisTokens = await _ailogRepository.GetTotalTokensAsync(thisMonthStart, now, cancellationToken);
            var thisCost   = await _ailogRepository.GetTotalCostAsync(thisMonthStart, now, cancellationToken);

            // Tháng trước
            var lastMonthStart = thisMonthStart.AddMonths(-1);
            var lastMonthEnd   = thisMonthStart.AddSeconds(-1);
            var lastCalls  = await _ailogRepository.GetTotalCallsAsync(lastMonthStart, lastMonthEnd, cancellationToken);
            var lastTokens = await _ailogRepository.GetTotalTokensAsync(lastMonthStart, lastMonthEnd, cancellationToken);
            var lastCost   = await _ailogRepository.GetTotalCostAsync(lastMonthStart, lastMonthEnd, cancellationToken);

            // 7 ngày gần nhất
            var last7DaysStart = now.AddDays(-7);
            var calls7d  = await _ailogRepository.GetTotalCallsAsync(last7DaysStart, now, cancellationToken);
            var tokens7d = await _ailogRepository.GetTotalTokensAsync(last7DaysStart, now, cancellationToken);
            var cost7d   = await _ailogRepository.GetTotalCostAsync(last7DaysStart, now, cancellationToken);

            return new AiSummaryResponseDto
            {
                ThisMonth = new AiPeriodStatsDto { TotalCalls = thisCalls, TotalTokens = thisTokens, TotalCostUsd = thisCost },
                LastMonth = new AiPeriodStatsDto { TotalCalls = lastCalls, TotalTokens = lastTokens, TotalCostUsd = lastCost },
                Last7Days = new AiPeriodStatsDto { TotalCalls = calls7d,  TotalTokens = tokens7d,  TotalCostUsd = cost7d  },

                CallsGrowthPct  = lastCalls  > 0 ? Math.Round((decimal)(thisCalls  - lastCalls)  / lastCalls  * 100, 1) : null,
                TokensGrowthPct = lastTokens > 0 ? Math.Round((decimal)(thisTokens - lastTokens) / lastTokens * 100, 1) : null,
                CostGrowthPct   = lastCost   > 0 ? Math.Round((thisCost   - lastCost)   / lastCost   * 100, 1) : null,
            };
        }
    }

    // ===== Handler 3: Logs phân trang =====
    public class GetAiLogsQueryHandler : IRequestHandler<GetAiLogsQuery, AiLogListResponseDto>
    {
        private readonly IAilogRepository _ailogRepository;

        public GetAiLogsQueryHandler(IAilogRepository ailogRepository)
        {
            _ailogRepository = ailogRepository;
        }

        public async Task<AiLogListResponseDto> Handle(GetAiLogsQuery request, CancellationToken cancellationToken)
        {
            var page     = request.Page     < 1  ? 1  : request.Page;
            var pageSize = request.PageSize < 1 || request.PageSize > 100 ? 20 : request.PageSize;

            var (items, totalCount) = await _ailogRepository.GetLogsPagedAsync(
                page, pageSize, request.Feature, cancellationToken);

            return new AiLogListResponseDto
            {
                Page       = page,
                PageSize   = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                Items      = items.Select(x => new AiLogItemDto
                {
                    Id         = x.Id,
                    UserId     = x.UserId,
                    Feature    = x.Feature,
                    InputText  = x.InputText,
                    TokensUsed = x.TokensUsed,
                    CostUsd    = x.Cost,
                    CreatedAt  = x.CreatedAt
                }).ToList()
            };
        }
    }
}
