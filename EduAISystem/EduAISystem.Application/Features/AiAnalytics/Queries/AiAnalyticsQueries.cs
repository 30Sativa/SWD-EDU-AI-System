using EduAISystem.Application.Features.AiAnalytics.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.AiAnalytics.Queries
{
    /// <summary>Query lấy dashboard tổng quan AI (30 ngày mặc định)</summary>
    public class GetAiDashboardQuery : IRequest<AiDashboardResponseDto>
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
    }

    /// <summary>Query lấy quick summary card numbers cho frontend</summary>
    public class GetAiSummaryQuery : IRequest<AiSummaryResponseDto> { }

    /// <summary>Query lấy danh sách log AI phân trang</summary>
    public class GetAiLogsQuery : IRequest<AiLogListResponseDto>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? Feature { get; set; }
    }
}
