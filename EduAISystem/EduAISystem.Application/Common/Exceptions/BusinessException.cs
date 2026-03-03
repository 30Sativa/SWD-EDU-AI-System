using System;

namespace EduAISystem.Application.Common.Exceptions
{
    public class BusinessException : AppException
    {
        public BusinessException(string message) : base(message)
        {
        }
    }
}
