using DocumentFormat.OpenXml.Packaging;
using EduAISystem.Application.Abstractions.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UglyToad.PdfPig;

namespace EduAISystem.Infrastructure.Services.FileStorage
{
    public class FileTextExtractor : IFileTextExtractor
    {
        public async Task<string> ExtractAsync(byte[] fileContent, string contentType)
        {
            if (contentType.Contains("pdf"))
            {
                return ExtractPdf(fileContent);
            }

            if (contentType.Contains("word") || contentType.Contains("officedocument"))
            {
                return ExtractWord(fileContent);
            }

            throw new NotSupportedException("Unsupported file type.");
        }

        private string ExtractPdf(byte[] fileContent)
        {
            using var stream = new MemoryStream(fileContent);
            using var document = PdfDocument.Open(stream);

            var sb = new StringBuilder();

            foreach (var page in document.GetPages())
            {
                sb.AppendLine(page.Text);
            }

            return sb.ToString();
        }

        private string ExtractWord(byte[] fileContent)
        {
            using var stream = new MemoryStream(fileContent);
            using var wordDoc = WordprocessingDocument.Open(stream, false);

            var body = wordDoc.MainDocumentPart?.Document.Body;

            if (body == null)
                return string.Empty;

            return body.InnerText;
        }
    }
}
