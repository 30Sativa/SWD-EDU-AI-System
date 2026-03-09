using DocumentFormat.OpenXml.Packaging;
using EduAISystem.Application.Abstractions.Persistence;
using ClosedXML.Excel;
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
            // Normalize contentType to lowercase for comparison
            var normalizedContentType = contentType.ToLowerInvariant();

            if (normalizedContentType.Contains("pdf"))
            {
                return ExtractPdf(fileContent);
            }

            // Check for Word documents (docx)
            if (normalizedContentType.Contains("wordprocessingml") || 
                normalizedContentType.Contains("application/msword") ||
                normalizedContentType.Contains("application/vnd.openxmlformats-officedocument.wordprocessingml"))
            {
                return ExtractWord(fileContent);
            }

            // Check for Excel documents (xlsx, xls)
            if (normalizedContentType.Contains("spreadsheetml") ||
                normalizedContentType.Contains("application/vnd.ms-excel") ||
                normalizedContentType.Contains("application/vnd.openxmlformats-officedocument.spreadsheetml"))
            {
                return ExtractExcel(fileContent);
            }

            throw new NotSupportedException($"Unsupported file type: {contentType}");
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

        private string ExtractExcel(byte[] fileContent)
        {
            using var stream = new MemoryStream(fileContent);
            using var workbook = new XLWorkbook(stream);
            
            var sb = new StringBuilder();

            // Extract text from all worksheets
            foreach (var worksheet in workbook.Worksheets)
            {
                if (!string.IsNullOrWhiteSpace(worksheet.Name))
                {
                    sb.AppendLine($"Sheet: {worksheet.Name}");
                }

                // Get all used rows
                var usedRows = worksheet.RowsUsed();
                
                foreach (var row in usedRows)
                {
                    var rowValues = new List<string>();
                    
                    foreach (var cell in row.CellsUsed())
                    {
                        var cellValue = cell.GetString();
                        if (!string.IsNullOrWhiteSpace(cellValue))
                        {
                            rowValues.Add(cellValue);
                        }
                    }
                    
                    if (rowValues.Any())
                    {
                        sb.AppendLine(string.Join(" | ", rowValues));
                    }
                }
                
                sb.AppendLine(); // Add blank line between sheets
            }

            return sb.ToString();
        }
    }
}
