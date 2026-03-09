using EduAISystem.Application.Features.Users.DTOs.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Common
{
    public interface IExcelUserParser
    {
        List<ImportedUserRequestDto> Parse(byte[] fileContent);
    }
}
