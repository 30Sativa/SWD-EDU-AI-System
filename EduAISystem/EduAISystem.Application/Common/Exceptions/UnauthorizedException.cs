using System;

namespace EduAISystem.Application.Common.Exceptions
{
    public class UnauthorizedException : AppException
    {
        public UnauthorizedException(string message) : base(message)
        {
        }
    }
}
