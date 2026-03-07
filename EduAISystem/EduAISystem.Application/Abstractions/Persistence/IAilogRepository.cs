using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IAilogRepository
    {
        Task AddAsync(AilogDomain ailog, CancellationToken cancellationToken = default);

        /// <summary>Tổng số lần gọi AI</summary>
        Task<int> GetTotalCallsAsync(DateTime? from, DateTime? to, CancellationToken ct = default);

        /// <summary>Tổng tokens đã dùng</summary>
        Task<int> GetTotalTokensAsync(DateTime? from, DateTime? to, CancellationToken ct = default);

        /// <summary>Tổng chi phí ước tính (USD)</summary>
        Task<decimal> GetTotalCostAsync(DateTime? from, DateTime? to, CancellationToken ct = default);

        /// <summary>Thống kê theo feature (GenerateLessonBlocks, ScanTemplateCourse, etc.)</summary>
        Task<List<AiFeatureStatsDto>> GetStatsByFeatureAsync(DateTime? from, DateTime? to, CancellationToken ct = default);

        /// <summary>Thống kê theo ngày (cho chart)</summary>
        Task<List<AiDailyStatsDto>> GetDailyStatsAsync(DateTime? from, DateTime? to, CancellationToken ct = default);

        /// <summary>Chi tiết logs (phân trang)</summary>
        Task<(List<AilogDomain> Items, int TotalCount)> GetLogsPagedAsync(int page, int pageSize, string? feature, CancellationToken ct = default);
    }

    // DTOs cho aggregation queries
    public class AiFeatureStatsDto
    {
        public string Feature { get; set; } = null!;
        public int TotalCalls { get; set; }
        public int TotalTokens { get; set; }
        public decimal TotalCost { get; set; }
        public decimal AvgTokensPerCall { get; set; }
    }

    public class AiDailyStatsDto
    {
        public DateTime Date { get; set; }
        public int TotalCalls { get; set; }
        public int TotalTokens { get; set; }
        public decimal TotalCost { get; set; }
    }
}
