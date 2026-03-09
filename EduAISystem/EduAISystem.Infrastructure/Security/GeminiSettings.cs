using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Security
{
    public class GeminiSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string ModelName { get; set; } = "gemini-pro";
        public string ApiVersion { get; set; } = "v1beta";

        /// <summary>
        /// Thời gian timeout khi gọi Gemini API (giây). Mặc định 60s.
        /// </summary>
        public int TimeoutSeconds { get; set; } = 60;
    }
}
