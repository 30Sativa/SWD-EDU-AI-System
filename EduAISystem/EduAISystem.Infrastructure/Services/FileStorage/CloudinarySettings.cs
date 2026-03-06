namespace EduAISystem.Infrastructure.Services.FileStorage;

/// <summary>
/// Cấu hình Cloudinary — đọc từ appsettings.json section "Cloudinary"
/// </summary>
public class CloudinarySettings
{
    public string CloudName { get; set; } = null!;
    public string ApiKey { get; set; } = null!;
    public string ApiSecret { get; set; } = null!;
}
