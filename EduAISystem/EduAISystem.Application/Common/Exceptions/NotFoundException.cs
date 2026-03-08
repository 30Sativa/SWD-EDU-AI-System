using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Common.Exceptions
{
    public class NotFoundException : AppException
    {
        public string? ErrorCode { get; }

        public NotFoundException(string message, string? errorCode = null) : base(message)
        {
            ErrorCode = errorCode;
        }
    }
}
