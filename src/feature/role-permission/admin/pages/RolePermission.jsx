import React, { useState } from 'react';
import {
  Grid3x3,
  Gem,
  Save,
  RotateCcw,
  Search,
  Info,
  X,
  Check,
  Code,
  Database,
  Trash2,
} from 'lucide-react';

export default function RolePermission() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [modules, setModules] = useState([
    {
      name: 'Quản lý Người dùng',
      description: 'Hồ sơ, phân công vai trò & xác thực',
      permissions: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        export: true,
      },
    },
    {
      name: 'Cấu hình Hệ thống',
      description: 'Khóa API toàn cục, mặc định Lớp học & nhận diện UI',
      permissions: {
        view: true,
        create: true,
        edit: true,
        delete: false,
        export: false,
      },
    },
    {
      name: 'Nhật ký Kiểm toán & Bảo mật',
      description: 'Theo dõi sự kiện và lịch sử sự cố bảo mật',
      permissions: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        export: true,
      },
    },
    {
      name: 'Nội dung Học thuật',
      description: 'Thiết kế chương trình học, thư viện & đăng ký học sinh',
      permissions: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        export: true,
      },
    },
  ]);

  const [privileges, setPrivileges] = useState({
    developerApiAccess: true,
    rawDataQueries: false,
  });

  const [affectedUsers] = useState(12);

  const togglePermission = (moduleIndex, permission) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].permissions[permission] =
      !updatedModules[moduleIndex].permissions[permission];
    setModules(updatedModules);
  };

  const togglePrivilege = (privilege) => {
    setPrivileges({
      ...privileges,
      [privilege]: !privileges[privilege],
    });
  };

  const handleRestoreDefaults = () => {
    setModules([
      {
        name: 'Quản lý Người dùng',
        description: 'Hồ sơ, phân công vai trò & xác thực',
        permissions: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          export: true,
        },
      },
      {
        name: 'Cấu hình Hệ thống',
        description: 'Khóa API toàn cục, mặc định Lớp học & nhận diện UI',
        permissions: {
          view: true,
          create: true,
          edit: true,
          delete: false,
          export: false,
        },
      },
      {
        name: 'Nhật ký Kiểm toán & Bảo mật',
        description: 'Theo dõi sự kiện và lịch sử sự cố bảo mật',
        permissions: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: true,
        },
      },
      {
        name: 'Nội dung Học thuật',
        description: 'Thiết kế chương trình học, thư viện & đăng ký học sinh',
        permissions: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          export: true,
        },
      },
    ]);
    setPrivileges({
      developerApiAccess: true,
      rawDataQueries: false,
    });
  };

  const handleSave = () => {
    // Logic to save changes
    console.log('Saving changes...', { modules, privileges });
  };

  const handleDiscard = () => {
    handleRestoreDefaults();
  };

  const handleApply = () => {
    handleSave();
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Ma trận Vai trò & Quyền
              </h1>
              <p className="text-gray-600">
                Điều chỉnh mức độ truy cập toàn hệ thống cho vai trò <strong>{selectedRole}</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRestoreDefaults}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Khôi phục Mặc định
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Save size={16} />
                Lưu Thay đổi Ma trận
              </button>
            </div>
          </div>

          {/* Search and Auto-save Info */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm module hoặc quyền..."
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info size={14} />
              <span>Đang tự động lưu bản nháp cục bộ</span>
            </div>
          </div>
        </div>

        {/* Core System Modules Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Grid3x3 size={20} className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">MODULE HỆ THỐNG CỐT LÕI</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    TÊN MODULE
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    XEM
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    TẠO
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    CHỈNH SỬA
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    XÓA
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    XUẤT
                  </th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{module.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                      </div>
                    </td>
                    {['view', 'create', 'edit', 'delete', 'export'].map((permission) => (
                      <td key={permission} className="py-4 px-4 text-center">
                        <button
                          onClick={() => togglePermission(index, permission)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            module.permissions[permission]
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-transparent hover:border-blue-400'
                          }`}
                        >
                          {module.permissions[permission] && <Check size={14} />}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advanced Privileges Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Gem size={20} className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">ĐẶC QUYỀN NÂNG CAO</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Developer API Access */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Code size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Truy cập API Nhà phát triển</h3>
                  </div>
                </div>
                <button
                  onClick={() => togglePrivilege('developerApiAccess')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privileges.developerApiAccess ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privileges.developerApiAccess ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Cấp quyền truy cập vào cổng nhà phát triển, tài liệu riêng tư và công cụ tạo webhook sản xuất.
              </p>
            </div>

            {/* Raw Data Queries */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Database size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Truy vấn Dữ liệu Thô</h3>
                  </div>
                </div>
                <button
                  onClick={() => togglePrivilege('rawDataQueries')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privileges.rawDataQueries ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privileges.rawDataQueries ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Cho phép giao diện truy vấn chỉ đọc trực tiếp để phân tích dữ liệu quy mô lớn và báo cáo tùy chỉnh.
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            Việc sửa đổi quyền sẽ ảnh hưởng đến <strong>{affectedUsers} người dùng</strong> hiện đang được phân công vai trò <strong>{selectedRole}</strong>.
          </p>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleDiscard}
            className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Áp dụng Thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
