using ClosedXML.Excel;
using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Features.Users.DTOs.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Services.Excel
{
    public class ExcelUserParser : IExcelUserParser
    {
        public List<ImportedUserRequestDto> Parse(byte[] fileContent)
        {
            using var ms = new MemoryStream(fileContent);
            using var workbook = new XLWorkbook(ms);
            var sheet = workbook.Worksheet(1);

            var rows = sheet.RowsUsed().Skip(1);

            var result = new List<ImportedUserRequestDto>();

            foreach (var row in rows)
            {
                result.Add(new ImportedUserRequestDto
                {
                    Email = row.Cell(1).GetString(),
                    FullName = row.Cell(2).GetString()
                });
            }

            return result;
        }
    }
}
