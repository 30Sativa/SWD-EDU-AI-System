namespace EduAISystem.Application.Common.Exceptions
{
    public class BusinessException : AppException
    {
        public string? ErrorCode { get; }

        public BusinessException(string message, string? errorCode = null) : base(message)
        {
            ErrorCode = errorCode;
        }
    }
}
