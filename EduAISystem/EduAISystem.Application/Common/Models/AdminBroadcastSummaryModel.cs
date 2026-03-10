using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Common.Models
{
    public class AdminBroadcastSummaryModel
    {
        public string Title { get; set; } = string.Empty;
        public string? Message { get; set; }
        public string? Link { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int ReceiverCount { get; set; }

        /// <summary>Danh sách các Role đã nhận thông báo này (phân biệt)</summary>
        public List<string> TargetRoles { get; set; } = new();
    }
}
