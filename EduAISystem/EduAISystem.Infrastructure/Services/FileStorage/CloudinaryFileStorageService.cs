using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using EduAISystem.Application.Abstractions.Common;
using Microsoft.Extensions.Options;

namespace EduAISystem.Infrastructure.Services.FileStorage;

/// <summary>
/// Implement IFileStorageService dùng Cloudinary.
/// Cloudinary free tier: 25GB storage, 25GB bandwidth/tháng — đủ dùng cho SWD project.
///
/// Tài liệu tham khảo: https://cloudinary.com/documentation/dotnet_integration
/// </summary>
public class CloudinaryFileStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    // Các loại file được coi là "raw" (không phải ảnh/video)
    private static readonly HashSet<string> _rawMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/zip",
        "text/plain",
    };

    public CloudinaryFileStorageService(IOptions<CloudinarySettings> options)
    {
        var settings = options.Value;
        var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    /// <inheritdoc />
    public async Task<FileUploadResult> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken ct = default)
    {
        // Xác định resource type: image, video, hay raw (PDF/DOCX/...)
        var resourceType = GetResourceType(contentType);

        // Tạo public_id dạng: "submissions/abc123_bai_nop"
        var safeFileName = Path.GetFileNameWithoutExtension(fileName)
            .Replace(" ", "_")
            .ToLowerInvariant();
        var uniqueId = $"{safeFileName}_{Guid.NewGuid():N}";
        var publicId = $"{folder}/{uniqueId}";

        if (resourceType == ResourceType.Raw)
        {
            var rawParams = new RawUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                PublicId = publicId,
                Folder = folder,
                UseFilename = false,
                UniqueFilename = false,
                Overwrite = false,
            };

            // Sử dụng chạy đồng bộ qua Task.Run vì CloudinaryDotNet thiếu API bất đồng bộ cho RawUploadParams
            var rawResult = await Task.Run(() => _cloudinary.Upload(rawParams), ct);

            if (rawResult.Error != null)
                throw new InvalidOperationException($"Cloudinary upload error: {rawResult.Error.Message}");

            return new FileUploadResult
            {
                FileUrl = rawResult.SecureUrl.ToString(),
                FileName = fileName,
                FileSizeBytes = rawResult.Bytes,
                FileType = GetFileExtension(fileName),
                PublicId = rawResult.PublicId,
            };
        }
        else
        {
            // Ảnh hoặc video
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                PublicId = publicId,
                Folder = folder,
                UseFilename = false,
                UniqueFilename = false,
                Overwrite = false,
            };

            var result = await _cloudinary.UploadAsync(uploadParams, ct);

            if (result.Error != null)
                throw new InvalidOperationException($"Cloudinary upload error: {result.Error.Message}");

            return new FileUploadResult
            {
                FileUrl = result.SecureUrl.ToString(),
                FileName = fileName,
                FileSizeBytes = result.Bytes,
                FileType = GetFileExtension(fileName),
                PublicId = result.PublicId,
            };
        }
    }

    /// <inheritdoc />
    public async Task DeleteAsync(string publicIdOrUrl, CancellationToken ct = default)
    {
        // Nếu là URL đầy đủ, lấy phần publicId từ URL
        var publicId = publicIdOrUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? ExtractPublicIdFromUrl(publicIdOrUrl)
            : publicIdOrUrl;

        if (string.IsNullOrEmpty(publicId)) return;

        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deleteParams);
    }

    // ==================== Helpers ====================

    private static ResourceType GetResourceType(string contentType)
    {
        if (_rawMimeTypes.Contains(contentType))
            return ResourceType.Raw;

        if (contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
            return ResourceType.Video;

        return ResourceType.Image; // mặc định: ảnh (jpg, png, gif, ...)
    }

    private static string GetFileExtension(string fileName)
    {
        var ext = Path.GetExtension(fileName).TrimStart('.').ToUpperInvariant();
        return string.IsNullOrEmpty(ext) ? "UNKNOWN" : ext;
    }

    /// <summary>
    /// Trích xuất publicId từ Cloudinary URL.
    /// Ví dụ: https://res.cloudinary.com/demo/raw/upload/v1/submissions/file_abc123.pdf
    /// → publicId = "submissions/file_abc123"
    /// </summary>
    private static string ExtractPublicIdFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            // Path dạng: /demo/raw/upload/v123456/submissions/file_abc.pdf
            var segments = uri.AbsolutePath.Split('/');
            // Tìm vị trí "upload" → lấy từ sau version (v123)
            var uploadIdx = Array.IndexOf(segments, "upload");
            if (uploadIdx < 0) return string.Empty;

            // Bỏ qua phần version (vXXX)
            var start = uploadIdx + 1;
            if (start < segments.Length && segments[start].StartsWith("v"))
                start++;

            // Ghép lại thành publicId và bỏ phần extension
            var publicIdWithExt = string.Join("/", segments.Skip(start));
            var dot = publicIdWithExt.LastIndexOf('.');
            return dot > 0 ? publicIdWithExt[..dot] : publicIdWithExt;
        }
        catch
        {
            return string.Empty;
        }
    }
}
