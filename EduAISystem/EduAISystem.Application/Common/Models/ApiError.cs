using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Common.Models
{
    public class ApiError
    {
        public string Message { get; set; } = "";
        /// <summary>Mã lỗi để FE xử lý theo logic (vd: QUIZ_NOT_FOUND, OPTION_HAS_ATTEMPTS).</summary>
        public string? ErrorCode { get; set; }
        public string? TraceId { get; set; }
        public int StatusCode { get; set; }
        public string? Detail { get; set; }
        public IDictionary<string, string[]>? Errors { get; set; }
    }
}
