namespace EduAISystem.Application.Abstractions.Common;

/// <summary>
/// Kết quả sau khi upload file thành công
/// </summary>
public class FileUploadResult
{
    /// <summary>URL công khai để truy cập file (CDN URL)</summary>
    public string FileUrl { get; set; } = null!;

    /// <summary>Tên file gốc (ví dụ: "bai_tap_toan.pdf")</summary>
    public string FileName { get; set; } = null!;

    /// <summary>Kích thước file tính bằng bytes</summary>
    public long FileSizeBytes { get; set; }

    /// <summary>Loại file: "PDF", "DOCX", "JPG", "PNG", "MP4", ...</summary>
    public string FileType { get; set; } = null!;

    /// <summary>Public ID trên Cloudinary (dùng để xóa sau này nếu cần)</summary>
    public string? PublicId { get; set; }
}

/// <summary>
/// Service upload / xóa file lên cloud storage (Cloudinary / Azure Blob / Local)
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Upload một file lên cloud storage.
    /// </summary>
    /// <param name="fileStream">Stream nội dung file</param>
    /// <param name="fileName">Tên file gốc (để lưu metadata)</param>
    /// <param name="contentType">MIME type, ví dụ "application/pdf"</param>
    /// <param name="folder">
    ///     Thư mục lưu trên cloud, ví dụ:
    ///     "submissions"   → bài nộp của học sinh
    ///     "lessons"       → tài liệu lesson của giáo viên
    ///     "documents"     → TeacherDocument dùng cho AI
    /// </param>
    /// <param name="ct">Cancellation token</param>
    Task<FileUploadResult> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken ct = default);

    /// <summary>
    /// Xóa file trên cloud theo publicId (Cloudinary) hoặc fileUrl.
    /// </summary>
    /// <param name="publicIdOrUrl">PublicId Cloudinary hoặc URL đầy đủ</param>
    Task DeleteAsync(string publicIdOrUrl, CancellationToken ct = default);
}
