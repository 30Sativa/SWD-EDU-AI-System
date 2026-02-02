using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Common
{
    public interface IClientContext
    {
        string DeviceName { get; } // tên thiết bị
        string IpAddress { get; } // địa chỉ Ip 
        string UserAgent { get; } // User agent trình duyệt
    }
}
