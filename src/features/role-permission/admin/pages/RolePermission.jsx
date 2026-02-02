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
  Shield,
  Users,
  GraduationCap,
  UserCog,
  ChevronDown,
} from 'lucide-react';

export default function RolePermission() {
  const allRoles = ['Quản trị viên', 'Quản lý', 'Giáo viên', 'Học sinh'];

  // Role Definitions
  const roleDefinitions = {
    'Quản trị viên': {
      icon: Shield,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600',
      description: 'Quyền truy cập toàn hệ thống, quản lý người dùng, cấu hình hệ thống và phân quyền.',
      responsibilities: [
        'Quản lý tất cả người dùng và tài khoản',
        'Cấu hình hệ thống và thiết lập toàn cục',
        'Phân quyền và quản lý vai trò',
        'Truy cập nhật ký kiểm toán và bảo mật',
        'Quản lý nội dung học thuật',
      ],
    },
    'Quản lý': {
      icon: UserCog,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      description: 'Quản lý nội dung học thuật, lớp học và học sinh trong phạm vi được phân công.',
      responsibilities: [
        'Quản lý lớp học và học sinh',
        'Tạo và quản lý nội dung học thuật',
        'Xem báo cáo và thống kê',
        'Quản lý giáo viên trong khu vực',
      ],
    },
    'Giáo viên': {
      icon: GraduationCap,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      description: 'Tạo và quản lý khóa học, bài học, câu hỏi và theo dõi tiến độ học sinh.',
      responsibilities: [
        'Tạo và quản lý khóa học, bài học',
        'Tạo câu hỏi và bài kiểm tra',
        'Theo dõi tiến độ học sinh',
        'Tương tác và hỗ trợ học sinh',
      ],
    },
    'Học sinh': {
      icon: Users,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
      description: 'Truy cập khóa học, học bài, làm bài kiểm tra và xem tiến độ học tập.',
      responsibilities: [
        'Tham gia khóa học và bài học',
        'Làm bài kiểm tra và bài tập',
        'Xem tiến độ học tập',
        'Tương tác với giáo viên',
      ],
    },
  };
  // Default permissions for each role
  const defaultPermissions = {
    'Quản trị viên': {
      'Quản lý Người dùng': { view: true, create: true, edit: true, delete: true, export: true },
      'Cấu hình Hệ thống': { view: true, create: true, edit: true, delete: false, export: false },
      'Nhật ký Kiểm toán & Bảo mật': { view: true, create: false, edit: false, delete: false, export: true },
      'Nội dung Học thuật': { view: true, create: true, edit: true, delete: true, export: true },
    },
    'Quản lý': {
      'Quản lý Người dùng': { view: true, create: false, edit: false, delete: false, export: true },
      'Cấu hình Hệ thống': { view: false, create: false, edit: false, delete: false, export: false },
      'Nhật ký Kiểm toán & Bảo mật': { view: true, create: false, edit: false, delete: false, export: true },
      'Nội dung Học thuật': { view: true, create: true, edit: true, delete: false, export: true },
    },
    'Giáo viên': {
      'Quản lý Người dùng': { view: false, create: false, edit: false, delete: false, export: false },
      'Cấu hình Hệ thống': { view: false, create: false, edit: false, delete: false, export: false },
      'Nhật ký Kiểm toán & Bảo mật': { view: false, create: false, edit: false, delete: false, export: false },
      'Nội dung Học thuật': { view: true, create: true, edit: true, delete: false, export: true },
    },
    'Học sinh': {
      'Quản lý Người dùng': { view: false, create: false, edit: false, delete: false, export: false },
      'Cấu hình Hệ thống': { view: false, create: false, edit: false, delete: false, export: false },
      'Nhật ký Kiểm toán & Bảo mật': { view: false, create: false, edit: false, delete: false, export: false },
      'Nội dung Học thuật': { view: true, create: false, edit: false, delete: false, export: false },
    },
  };

  // State to manage all roles' permissions
  const [allRolesPermissions, setAllRolesPermissions] = useState(() => {
    const permissions = {};
    allRoles.forEach((role) => {
      permissions[role] = {
        'Quản lý Người dùng': { ...defaultPermissions[role]['Quản lý Người dùng'] },
        'Cấu hình Hệ thống': { ...defaultPermissions[role]['Cấu hình Hệ thống'] },
        'Nhật ký Kiểm toán & Bảo mật': { ...defaultPermissions[role]['Nhật ký Kiểm toán & Bảo mật'] },
        'Nội dung Học thuật': { ...defaultPermissions[role]['Nội dung Học thuật'] },
      };
    });
    return permissions;
  });

  const [allRolesPrivileges, setAllRolesPrivileges] = useState(() => {
    const privileges = {};
    allRoles.forEach((role) => {
      privileges[role] = {
        developerApiAccess: role === 'Quản trị viên',
        rawDataQueries: false,
      };
    });
    return privileges;
  });

  // Mock affected users count by role
  const affectedUsersByRole = {
    'Quản trị viên': 12,
    'Quản lý': 45,
    'Giáo viên': 128,
    'Học sinh': 1240,
  };

  const totalAffectedUsers = Object.values(affectedUsersByRole).reduce((sum, count) => sum + count, 0);

  const modulesList = [
    {
      name: 'Quản lý Người dùng',
      description: 'Hồ sơ, phân công vai trò & xác thực',
    },
    {
      name: 'Cấu hình Hệ thống',
      description: 'Khóa API toàn cục, mặc định Lớp học & nhận diện UI',
    },
    {
      name: 'Nhật ký Kiểm toán & Bảo mật',
      description: 'Theo dõi sự kiện và lịch sử sự cố bảo mật',
    },
    {
      name: 'Nội dung Học thuật',
      description: 'Thiết kế chương trình học, thư viện & đăng ký học sinh',
    },
  ];

  const togglePermission = (role, moduleName, permission) => {
    setAllRolesPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleName]: {
          ...prev[role][moduleName],
          [permission]: !prev[role][moduleName][permission],
        },
      },
    }));
  };

  const togglePrivilege = (role, privilege) => {
    setAllRolesPrivileges((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [privilege]: !prev[role][privilege],
      },
    }));
  };

  const handleRestoreDefaults = () => {
    const permissions = {};
    const privileges = {};
    allRoles.forEach((role) => {
      permissions[role] = {
        'Quản lý Người dùng': { ...defaultPermissions[role]['Quản lý Người dùng'] },
        'Cấu hình Hệ thống': { ...defaultPermissions[role]['Cấu hình Hệ thống'] },
        'Nhật ký Kiểm toán & Bảo mật': { ...defaultPermissions[role]['Nhật ký Kiểm toán & Bảo mật'] },
        'Nội dung Học thuật': { ...defaultPermissions[role]['Nội dung Học thuật'] },
      };
      privileges[role] = {
        developerApiAccess: role === 'Quản trị viên',
        rawDataQueries: false,
      };
    });
    setAllRolesPermissions(permissions);
    setAllRolesPrivileges(privileges);
  };

  const handleSave = () => {
    // Logic to save changes
    console.log('Saving changes...', { allRolesPermissions, allRolesPrivileges });
    alert('Đã lưu tất cả thay đổi phân quyền thành công!');
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
                Quản lý và điều chỉnh mức độ truy cập toàn hệ thống cho tất cả các vai trò trong hệ thống.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRestoreDefaults}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Khôi phục Tất cả Mặc định
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Save size={16} />
                Lưu Tất cả Thay đổi
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

        {/* Role Definitions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={20} className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">ĐỊNH NGHĨA VAI TRÒ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(roleDefinitions).map(([role, def]) => {
              const DefIcon = def.icon;
              return (
                <div key={role} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg ${def.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <DefIcon size={24} className={def.iconColor} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{role}</h3>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${def.bgColor} ${def.textColor}`}>
                          {role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{def.description}</p>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">Trách nhiệm:</h4>
                        <ul className="space-y-1">
                          {def.responsibilities.slice(0, 3).map((responsibility, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                              <Check size={12} className="text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{responsibility}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Privileges Section - All Roles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Gem size={20} className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">ĐẶC QUYỀN NÂNG CAO - TẤT CẢ VAI TRÒ</h2>
          </div>

          <div className="space-y-6">
            {/* Developer API Access */}
            <div>
              <div className="border border-gray-200 rounded-lg p-5 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Code size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Truy cập API Nhà phát triển</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Cấp quyền truy cập vào cổng nhà phát triển, tài liệu riêng tư và công cụ tạo webhook sản xuất.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {allRoles.map((role) => {
                    const roleDef = roleDefinitions[role];
                    const RoleIcon = roleDef.icon;
                    return (
                      <div key={role} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <RoleIcon size={16} className={roleDef.iconColor} />
                          <span className="text-xs font-medium text-gray-700">{role}</span>
                        </div>
                        <button
                          onClick={() => togglePrivilege(role, 'developerApiAccess')}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            allRolesPrivileges[role].developerApiAccess ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              allRolesPrivileges[role].developerApiAccess ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Raw Data Queries */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Database size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Truy vấn Dữ liệu Thô</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Cho phép giao diện truy vấn chỉ đọc trực tiếp để phân tích dữ liệu quy mô lớn và báo cáo tùy chỉnh.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {allRoles.map((role) => {
                    const roleDef = roleDefinitions[role];
                    const RoleIcon = roleDef.icon;
                    return (
                      <div key={role} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <RoleIcon size={16} className={roleDef.iconColor} />
                          <span className="text-xs font-medium text-gray-700">{role}</span>
                        </div>
                        <button
                          onClick={() => togglePrivilege(role, 'rawDataQueries')}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            allRolesPrivileges[role].rawDataQueries ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              allRolesPrivileges[role].rawDataQueries ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Việc sửa đổi quyền sẽ ảnh hưởng đến <strong>{totalAffectedUsers} người dùng</strong> trong toàn hệ thống.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-blue-200">
            {allRoles.map((role) => {
              const roleDef = roleDefinitions[role];
              const RoleIcon = roleDef.icon;
              return (
                <div key={role} className="flex items-center gap-2 text-xs">
                  <RoleIcon size={14} className={roleDef.iconColor} />
                  <span className="text-gray-700">
                    <strong>{role}:</strong> {affectedUsersByRole[role]} người dùng
                  </span>
                </div>
              );
            })}
          </div>
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
