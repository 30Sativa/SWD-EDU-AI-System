using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IFileTextExtractor
    {
        Task<string> ExtractAsync(byte[] fileContent, string contentType);
    }
}
