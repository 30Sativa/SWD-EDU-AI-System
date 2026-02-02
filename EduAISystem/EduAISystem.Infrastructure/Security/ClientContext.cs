using EduAISystem.Application.Abstractions.Common;
using Microsoft.AspNetCore.Http;
namespace EduAISystem.Infrastructure.Security
{
    public class ClientContext : IClientContext
    {
        private readonly IHttpContextAccessor _http;

        public ClientContext(IHttpContextAccessor http)
        {
            _http = http;
        }
        public string DeviceName => _http.HttpContext?.Request?.Headers["sec-ch-ua-platform"].ToString() ?? "unknown";

        public string IpAddress => _http.HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "unknown";

        public string UserAgent => _http.HttpContext?.Request?.Headers["User-Agent"].ToString() ?? "unknown";
    }
}
