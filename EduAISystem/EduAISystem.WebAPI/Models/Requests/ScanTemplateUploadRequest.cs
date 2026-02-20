namespace EduAISystem.WebAPI.Models.Requests
{
    public class ScanTemplateUploadRequest
    {
        public IFormFile File { get; set; } = default!;
    }
}
