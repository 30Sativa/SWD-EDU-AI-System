namespace EduAISystem.Application.Features.AiAnalytics.DTOs.Response
{
    /// <summary>Tổng quan chi phí AI cho Admin Dashboard</summary>
    public class AiDashboardResponseDto
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public int TotalCalls { get; set; }
        public int TotalTokens { get; set; }
        public decimal TotalCostUsd { get; set; }
        public decimal AvgCostPerCall { get; set; }
        public decimal AvgTokensPerCall { get; set; }
        public List<AiFeatureStatsResponseDto> ByFeature { get; set; } = new();
        public List<AiDailyStatsResponseDto> DailyStats { get; set; } = new();
    }

    public class AiFeatureStatsResponseDto
    {
        public string Feature { get; set; } = null!;
        public string FeatureDisplayName { get; set; } = null!;
        public int TotalCalls { get; set; }
        public int TotalTokens { get; set; }
        public decimal TotalCostUsd { get; set; }
        public decimal AvgTokensPerCall { get; set; }
        public decimal PercentOfTotalCalls { get; set; }
    }

    public class AiDailyStatsResponseDto
    {
        public string Date { get; set; } = null!;
        public int TotalCalls { get; set; }
        public int TotalTokens { get; set; }
        public decimal TotalCostUsd { get; set; }
    }

    /// <summary>Quick summary - card numbers cho dashboard frontend</summary>
    public class AiSummaryResponseDto
    {
        public AiPeriodStatsDto ThisMonth { get; set; } = new();
        public AiPeriodStatsDto LastMonth { get; set; } = new();
        public AiPeriodStatsDto Last7Days { get; set; } = new();
        public decimal? CallsGrowthPct { get; set; }
        public decimal? TokensGrowthPct { get; set; }
        public decimal? CostGrowthPct { get; set; }
    }

    public class AiPeriodStatsDto
    {
        public int TotalCalls { get; set; }
        public int TotalTokens { get; set; }
        public decimal TotalCostUsd { get; set; }
    }

    /// <summary>Danh sách log AI phân trang</summary>
    public class AiLogListResponseDto
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public List<AiLogItemDto> Items { get; set; } = new();
    }

    public class AiLogItemDto
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? Feature { get; set; }
        public string? InputText { get; set; }
        public int? TokensUsed { get; set; }
        public decimal? CostUsd { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
