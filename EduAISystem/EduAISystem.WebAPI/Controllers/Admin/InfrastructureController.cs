using EduAISystem.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Diagnostics;

namespace EduAISystem.WebAPI.Controllers.Admin
{
    [Route("api/admin/infrastructure")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class InfrastructureController : ControllerBase
    {
        [HttpGet]
        [SwaggerOperation(Summary = "Xem chỉ số hạ tầng (Server theo thời gian thực)")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<object>))]
        public async Task<IActionResult> GetInfrastructureStats()
        {
            var isLinux = OperatingSystem.IsLinux();
            var process = Process.GetCurrentProcess();
            var gcInfo = GC.GetGCMemoryInfo();
            
            // 1. Uptime
            var appStartTime = process.StartTime.ToUniversalTime();
            var appUptime = DateTime.UtcNow - appStartTime;
            var osUptime = TimeSpan.FromMilliseconds(Environment.TickCount64);

            // 2. RAM
            double totalRamMb = gcInfo.TotalAvailableMemoryBytes / 1024.0 / 1024.0;
            double appRamUsageMb = process.WorkingSet64 / 1024.0 / 1024.0;
            
            // Tính số RAM mà toàn bộ Server đang dùng (mặc định lấy % RAM App đang chiếm nếu là Windows)
            double serverRamUsageMb = appRamUsageMb; 
            double serverRamUsagePercentage = (appRamUsageMb / totalRamMb) * 100;

            if (isLinux)
            {
                try
                {
                    // Đọc từ /proc/meminfo để lấy số liệu thực trên Linux/Ubuntu chuẩn xác
                    var memInfo = await System.IO.File.ReadAllLinesAsync("/proc/meminfo");
                    var memTotalLine = memInfo.FirstOrDefault(x => x.StartsWith("MemTotal:"));
                    var memAvailableLine = memInfo.FirstOrDefault(x => x.StartsWith("MemAvailable:"));
                    
                    if (memTotalLine != null && memAvailableLine != null)
                    {
                        var memTotalKb = double.Parse(new string(memTotalLine.Where(char.IsDigit).ToArray()));
                        var memAvailableKb = double.Parse(new string(memAvailableLine.Where(char.IsDigit).ToArray()));
                        
                        totalRamMb = memTotalKb / 1024.0;
                        var availableRamMb = memAvailableKb / 1024.0;
                        serverRamUsageMb = totalRamMb - availableRamMb;
                        serverRamUsagePercentage = (serverRamUsageMb / totalRamMb) * 100;
                    }
                }
                catch { } // Nếu không có quyền đọc, fallback về số liệu có sẵn
            }

            // 3. CPU App đang dùng
            double appCpuLoad = await GetAppCpuUsagePercentage();

            // Load average cho Linux Server CPU (Giống chỉ số System load: 0.03 trong hình)
            string serverLoadAvg = "N/A";
            if (isLinux)
            {
                try
                {
                    var loadAvg = await System.IO.File.ReadAllTextAsync("/proc/loadavg");
                    serverLoadAvg = loadAvg.Split(' ')[0]; // Lấy System load 1-phút
                }
                catch { }
            }

            // 4. Disk space của root path ('/' trên Linux)
            double diskTotalGb = 0;
            double diskUsedGb = 0;
            double diskUsedPercentage = 0;
            try
            {
                var drive = new DriveInfo(isLinux ? "/" : "C:\\");
                diskTotalGb = drive.TotalSize / 1024.0 / 1024.0 / 1024.0;
                diskUsedGb = (drive.TotalSize - drive.AvailableFreeSpace) / 1024.0 / 1024.0 / 1024.0;
                diskUsedPercentage = (diskUsedGb / diskTotalGb) * 100;
            }
            catch { }

            var stats = new
            {
                os = new
                {
                    platform = Environment.OSVersion.ToString(),
                    isLinux = isLinux
                },
                hardware = new
                {
                    logicalCores = Environment.ProcessorCount,
                },
                uptime = new
                {
                    app = $"{appUptime.Days}d {appUptime.Hours}h {appUptime.Minutes}m {appUptime.Seconds}s",
                    server = $"{osUptime.Days}d {osUptime.Hours}h {osUptime.Minutes}m {osUptime.Seconds}s"
                },
                memory = new
                {
                    totalMb = Math.Round(totalRamMb, 2),
                    appUsedMb = Math.Round(appRamUsageMb, 2),
                    serverUsedMb = Math.Round(serverRamUsageMb, 2),
                    serverUsedPercentage = Math.Round(serverRamUsagePercentage, 2)
                },
                cpu = new
                {
                    appUsedPercentage = Math.Round(appCpuLoad, 2),
                    serverLoadAvg = serverLoadAvg
                },
                disk = new
                {
                    rootTotalGb = Math.Round(diskTotalGb, 2),
                    rootUsedGb = Math.Round(diskUsedGb, 2),
                    rootUsedPercentage = Math.Round(diskUsedPercentage, 2)
                }
            };

            return Ok(ApiResponse<object>.Ok(stats, "Lấy chỉ số hạ tầng thành công. Phù hợp 100% EC2!"));
        }

        private async Task<double> GetAppCpuUsagePercentage()
        {
            try
            {
                var process = Process.GetCurrentProcess();
                var startTime = DateTime.UtcNow;
                var startCpuUsage = process.TotalProcessorTime;

                // Delay siêu ngắn lấy bước sóng CPU không làm xệ Request
                await Task.Delay(200);

                var endTime = DateTime.UtcNow;
                var endCpuUsage = process.TotalProcessorTime;
                
                var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
                var totalMsPassed = (endTime - startTime).TotalMilliseconds;
                var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);
                
                return Math.Max(0, cpuUsageTotal * 100);
            }
            catch
            {
                return 0;
            }
        }
    }
}
