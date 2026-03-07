using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.AiAnalytics.DTOs.Response;
using EduAISystem.Application.Features.AiAnalytics.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EduAISystem.WebAPI.Controllers.Manager
{
    /// <summary>
    /// Admin Dashboard: Thống kê chi phí và sử dụng EduVN AI.
    /// Chỉ dành cho Manager/Admin.
    /// </summary>
    [Route("api/manager/ai-analytics")]
    [ApiController]
    [Authorize(Roles = "Manager,Admin")]
    public class AiAnalyticsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AiAnalyticsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ===== DASHBOARD TỔNG QUAN =====
        [HttpGet("dashboard")]
        [SwaggerOperation(
            Summary = "Dashboard thống kê AI (Admin)",
            Description = """
                Tổng quan chi phí và sử dụng EduVN AI trong hệ thống.

                **Các chỉ số bao gồm:**
                - Tổng số lần gọi AI, tổng tokens, tổng chi phí (USD)
                - Chi phí trung bình / tokens trung bình mỗi request
                - Thống kê theo từng chức năng: Lesson AI, Course AI, Streaming
                - Thống kê theo ngày (dùng cho biểu đồ line/bar chart frontend)

                **Query params:**
                - `from` / `to`: lọc theo khoảng thời gian (mặc định 30 ngày gần nhất)

                **Ghi chú chi phí:** Ước tính theo giá Gemini 3.1 Pro Preview:
                - Input: $0.075 / 1M tokens  •  Output: $0.30 / 1M tokens
                """)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AiDashboardResponseDto>))]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GetAiDashboardQuery { From = from, To = to }, ct);

            var summary = $"AI Dashboard: {result.TotalCalls} requests • {result.TotalTokens:N0} tokens • " +
                          $"~${result.TotalCostUsd:F4} USD trong {(result.To - result.From).Days} ngày";

            return Ok(ApiResponse<AiDashboardResponseDto>.Ok(result, summary));
        }

        // ===== QUICK SUMMARY CARDS =====
        [HttpGet("summary")]
        [SwaggerOperation(
            Summary = "Quick stats cards (tháng này / tháng trước / 7 ngày)",
            Description = """
                Trả về số liệu nhanh cho các card trên dashboard:
                - **ThisMonth**: tháng hiện tại
                - **LastMonth**: tháng trước (để so sánh)
                - **Last7Days**: 7 ngày gần nhất
                - **GrowthPct**: % tăng/giảm calls, tokens, cost so với tháng trước
                """)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AiSummaryResponseDto>))]
        public async Task<IActionResult> GetSummary(CancellationToken ct)
        {
            var result = await _mediator.Send(new GetAiSummaryQuery(), ct);
            return Ok(ApiResponse<AiSummaryResponseDto>.Ok(result, "AI Usage Summary."));
        }

        // ===== LOG CHI TIẾT PHÂN TRANG =====
        [HttpGet("logs")]
        [SwaggerOperation(
            Summary = "Danh sách log AI chi tiết (phân trang)",
            Description = """
                Xem lịch sử từng lần gọi AI: feature, tokens dùng, chi phí, thời gian.

                **Query params:**
                - `page` / `pageSize`: phân trang (mặc định 1 / 20, tối đa 100)
                - `feature`: lọc theo chức năng:
                  - `GenerateLessonBlocks` — Sinh block bài học
                  - `GenerateLessonBlocksStream` — Sinh block streaming
                  - `ScanTemplateCourse` — Phân tích khoá học
                """)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AiLogListResponseDto>))]
        public async Task<IActionResult> GetLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? feature = null,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(
                new GetAiLogsQuery { Page = page, PageSize = pageSize, Feature = feature }, ct);

            return Ok(ApiResponse<AiLogListResponseDto>.Ok(result,
                $"Tìm thấy {result.TotalCount} logs AI."));
        }
    }
}
