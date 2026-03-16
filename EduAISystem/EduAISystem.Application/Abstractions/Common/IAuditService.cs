using System;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Common
{
    public interface IAuditService
    {
        /// <summary>
        /// Ghi log hành động của người dùng
        /// </summary>
        /// <param name="action">Tên hành động (vd: CREATE_USER, DELETE_COURSE)</param>
        /// <param name="entityName">Tên thực thể (vd: User, Course)</param>
        /// <param name="entityId">ID của thực thể</param>
        /// <param name="oldValues">Giá trị cũ (JSON - tùy chọn)</param>
        /// <param name="newValues">Giá trị mới (JSON - tùy chọn)</param>
        void LogAction(string action, string entityName, Guid? entityId = null, object? oldValues = null, object? newValues = null);
    }
}
