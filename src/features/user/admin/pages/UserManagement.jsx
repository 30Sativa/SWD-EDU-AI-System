import React, { useState, useRef, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Filter, Download, Upload, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Save, Power, PowerOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import { message, Spin } from 'antd';
import { getUsers, getRoleName, ROLE_ENUM } from "../../api/userApi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Học sinh',
    status: 'Hoạt động',
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        let roleFilterVal = null;
        if (filterRole === 'Admin') roleFilterVal = ROLE_ENUM.ADMIN;
        else if (filterRole === 'Manager') roleFilterVal = ROLE_ENUM.MANAGER;
        else if (filterRole === 'User') roleFilterVal = ROLE_ENUM.USER;

        let isActiveFilterVal = null;
        if (filterStatus === 'Hoạt động') isActiveFilterVal = true;
        else if (filterStatus === 'Tạm khóa') isActiveFilterVal = false;

        const params = {
          SearchTerm: searchTerm || null,
          RoleFilter: roleFilterVal,
          IsActiveFilter: isActiveFilterVal,
          Page: 1,
          PageSize: 100 // Tạm thời lấy nhiều
        };

        const response = await getUsers(params);

        console.log("API Response:", response);

        // Robust parsing of response
        let rawItems = [];
        if (Array.isArray(response)) {
          rawItems = response;
        } else if (response && Array.isArray(response.items)) {
          rawItems = response.items;
        } else if (response && Array.isArray(response.data)) {
          rawItems = response.data;
        } else if (response && response.data && Array.isArray(response.data.items)) {
          rawItems = response.data.items;
        } else {
          console.warn("API returned unexpected structure:", response);
        }

        const mappedUsers = rawItems.map(u => ({
          id: u.id,
          name: u.fullName || u.userName || 'No Name',
          email: u.email || u.userName,
          role: getRoleName(u.role), // Convert number to string for display
          status: u.isActive ? 'Hoạt động' : 'Tạm khóa',
          joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        // message.error("Lỗi tải danh sách người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filterRole, filterStatus]);

  // Client-side sorting on the fetched list
  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'Tất cả' || user.role === filterRole;
      const matchesStatus = filterStatus === 'Tất cả' || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let aValue = a[sortField];
      let bValue = b[sortField];
      // Handle date sorting
      if (sortField === 'joinDate') {
        aValue = new Date(aValue.split('/').reverse().join('-'));
        bValue = new Date(bValue.split('/').reverse().join('-'));
      }
      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  // Parse CSV file (handles quoted values)
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Simple CSV parser that handles quoted values
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
      if (values.length === 0 || !values[0]) continue;

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  // Parse Excel file
  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Normalize imported data
  const normalizeImportedData = (rawData) => {
    return rawData.map((row, index) => {
      // Map various column name formats
      const name = row.name || row.tên || row.Name || row.Tên || row['Họ và tên'] || '';
      const email = row.email || row.Email || row['Email Address'] || row['Địa chỉ email'] || '';
      const role = row.role || row.vaitro || row.Role || row['Vai trò'] || 'Học sinh';
      const status = row.status || row.trangthai || row.Status || row['Trạng thái'] || 'Hoạt động';

      return {
        name: name.toString().trim(),
        email: email.toString().trim().toLowerCase(),
        role: role.toString().trim(),
        status: status.toString().trim(),
        rowIndex: index + 2, // +2 because of header and 0-index
      };
    });
  };

  // Validate imported data
  const validateImportedData = (normalizedData) => {
    const errors = [];
    const validData = [];

    normalizedData.forEach((row, index) => {
      const rowErrors = [];

      if (!row.name || row.name.length === 0) {
        rowErrors.push('Thiếu tên');
      }

      if (!row.email || row.email.length === 0) {
        rowErrors.push('Thiếu email');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        rowErrors.push('Email không hợp lệ');
      }

      // Check for duplicate email in existing users
      const existingUser = users.find(u => u.email.toLowerCase() === row.email.toLowerCase());
      if (existingUser) {
        rowErrors.push('Email đã tồn tại trong hệ thống');
      }

      // Check for duplicate email in imported data
      const duplicateInImport = normalizedData.slice(0, index).find(r => r.email.toLowerCase() === row.email.toLowerCase());
      if (duplicateInImport) {
        rowErrors.push('Email trùng lặp trong file');
      }

      const validRoles = ['Học sinh', 'Giáo viên', 'Quản lý', 'Quản trị viên'];
      if (!validRoles.includes(row.role)) {
        rowErrors.push(`Vai trò không hợp lệ. Phải là một trong: ${validRoles.join(', ')}`);
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: row.rowIndex,
          data: row,
          errors: rowErrors,
        });
      } else {
        validData.push(row);
      }
    });

    return { validData, errors };
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    setIsImporting(true);
    setImportErrors([]);
    setImportPreview([]);

    try {
      let rawData = [];

      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const text = await file.text();
        rawData = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        rawData = await parseExcel(file);
      } else {
        alert('Định dạng file không được hỗ trợ. Vui lòng chọn file CSV hoặc Excel (.xlsx, .xls)');
        setIsImporting(false);
        return;
      }

      const normalizedData = normalizeImportedData(rawData);
      const { validData, errors } = validateImportedData(normalizedData);

      setImportPreview(validData);
      setImportErrors(errors);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle import confirmation
  const handleImportConfirm = () => {
    if (importPreview.length === 0) {
      alert('Không có dữ liệu hợp lệ để import');
      return;
    }

    const newUsers = importPreview.map((row, index) => ({
      id: users.length + index + 1,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status || 'Hoạt động',
      joinDate: new Date().toLocaleDateString('vi-VN'),
    }));

    setUsers([...users, ...newUsers]);
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    setImportErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    alert(`Đã thêm thành công ${newUsers.length} người dùng vào hệ thống!`);
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const csvContent = [
      ['Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tham gia'],
      ...filteredAndSortedUsers.map(user => [user.name, user.email, user.role, user.status, user.joinDate]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Handle export Excel
  const handleExportExcel = () => {
    const worksheetData = [
      ['Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tham gia'],
      ...filteredAndSortedUsers.map(user => [user.name, user.email, user.role, user.status, user.joinDate]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Handle create user
  const handleCreateUser = () => {
    if (!formData.name || !formData.email) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Email không hợp lệ');
      return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (existingUser) {
      alert('Email đã tồn tại trong hệ thống');
      return;
    }

    const newUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email.toLowerCase(),
      role: formData.role,
      status: formData.status,
      joinDate: new Date().toLocaleDateString('vi-VN'),
    };

    setUsers([...users, newUser]);
    setShowCreateModal(false);
    setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
    alert('Đã tạo người dùng mới thành công!');
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  // Handle update user
  const handleUpdateUser = () => {
    if (!formData.name || !formData.email) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Email không hợp lệ');
      return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUser.id);
    if (existingUser) {
      alert('Email đã tồn tại trong hệ thống');
      return;
    }

    setUsers(users.map(user =>
      user.id === editingUser.id
        ? { ...user, name: formData.name, email: formData.email.toLowerCase(), role: formData.role, status: formData.status }
        : user
    ));

    setShowEditModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
    alert('Đã cập nhật thông tin người dùng thành công!');
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}"?`)) {
      setUsers(users.filter(u => u.id !== user.id));
      alert('Đã xóa người dùng thành công!');
    }
  };

  // Handle toggle status
  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
    setUsers(users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    alert(`Đã ${newStatus === 'Hoạt động' ? 'kích hoạt' : 'tạm khóa'} tài khoản của ${user.name}`);
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>
              <p className="text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                <Upload size={16} />
                Nhập File
              </button>
              <button
                onClick={() => {
                  setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Thêm Người dùng
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
              >
                <option>Tất cả</option>
                <option>Học sinh</option>
                <option>Giáo viên</option>
                <option>Quản lý</option>
                <option>Quản trị viên</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
              >
                <option>Tất cả</option>
                <option>Hoạt động</option>
                <option>Tạm khóa</option>
              </select>
              <div className="relative group">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                  <Download size={16} />
                  Xuất
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Xuất CSV
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    Xuất Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : (<>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      >
                        Tên
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      >
                        Email
                        {getSortIcon('email')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      >
                        Vai trò
                        {getSortIcon('role')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      >
                        Trạng thái
                        {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('joinDate')}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      >
                        Ngày tham gia
                        {getSortIcon('joinDate')}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${user.role.includes('Quản trị viên') || user.role.includes('Admin') ? 'bg-purple-100 text-purple-700' :
                          user.role.includes('Quản lý') || user.role.includes('Manager') ? 'bg-orange-100 text-orange-700' :
                            user.role.includes('Giáo viên') || user.role.includes('Teacher') ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${user.status === 'Hoạt động'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{user.joinDate}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg transition-colors ${user.status === 'Hoạt động'
                              ? 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                              }`}
                            aria-label={user.status === 'Hoạt động' ? 'Tạm khóa' : 'Kích hoạt'}
                            title={user.status === 'Hoạt động' ? 'Tạm khóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            {user.status === 'Hoạt động' ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedUsers.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Không tìm thấy người dùng nào</p>
              </div>
            )}
          </>
          )}
        </div>

        {/* Import Modal */}
        {
          showImportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Nhập Người dùng từ File</h2>
                    <p className="text-sm text-gray-600 mt-1">Hỗ trợ file CSV và Excel (.xlsx, .xls)</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setImportPreview([]);
                      setImportErrors([]);
                      setShowAllPreview(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      {importFile ? (
                        <>
                          <FileSpreadsheet size={48} className="text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(importFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImportFile(null);
                              setImportPreview([]);
                              setImportErrors([]);
                              setShowAllPreview(false);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Xóa file
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={48} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Click để chọn file hoặc kéo thả file vào đây
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              CSV, XLSX, XLS (Tối đa 10MB)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Loading State */}
                  {isImporting && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600 mt-2">Đang xử lý file...</p>
                    </div>
                  )}

                  {/* Preview Valid Data */}
                  {importPreview.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={20} className="text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Dữ liệu hợp lệ ({importPreview.length} người dùng)
                          </h3>
                        </div>
                        {importPreview.length > 10 && (
                          <button
                            onClick={() => setShowAllPreview(!showAllPreview)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {showAllPreview ? 'Thu gọn' : `Xem tất cả (${importPreview.length})`}
                          </button>
                        )}
                      </div>

                      {/* Summary Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {['Học sinh', 'Giáo viên', 'Quản lý', 'Quản trị viên'].map((role) => {
                          const count = importPreview.filter((r) => r.role === role).length;
                          return (
                            <div key={role} className="bg-white rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">{role}</p>
                              <p className="text-lg font-bold text-gray-900">{count}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Preview Table */}
                      <div className="border border-green-200 rounded-lg overflow-hidden bg-white">
                        <div className="overflow-x-auto" style={{ maxHeight: showAllPreview ? '400px' : '300px' }}>
                          <table className="w-full text-sm">
                            <thead className="bg-green-50 sticky top-0">
                              <tr>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  STT
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Tên
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Email
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Vai trò
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Trạng thái
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(showAllPreview ? importPreview : importPreview.slice(0, 10)).map((row, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                  <td className="py-3 px-4 text-gray-600 font-medium">{index + 1}</td>
                                  <td className="py-3 px-4 font-semibold text-gray-900">{row.name}</td>
                                  <td className="py-3 px-4 text-gray-700">{row.email}</td>
                                  <td className="py-3 px-4">
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                      {row.role}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${row.status === 'Hoạt động'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {!showAllPreview && importPreview.length > 10 && (
                          <div className="bg-green-50 px-4 py-3 text-sm text-gray-600 text-center border-t border-green-200">
                            Đang hiển thị 10/{importPreview.length} người dùng.
                            <button
                              onClick={() => setShowAllPreview(true)}
                              className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                            >
                              Xem tất cả
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Messages */}
                  {importErrors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle size={20} className="text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Lỗi ({importErrors.length} dòng)
                        </h3>
                      </div>
                      <div className="border border-red-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-64">
                          <table className="w-full text-sm">
                            <thead className="bg-red-50 sticky top-0">
                              <tr>
                                <th className="text-left py-2 px-3 font-semibold text-red-700">Dòng</th>
                                <th className="text-left py-2 px-3 font-semibold text-red-700">Dữ liệu</th>
                                <th className="text-left py-2 px-3 font-semibold text-red-700">Lỗi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importErrors.slice(0, 10).map((error, index) => (
                                <tr key={index} className="border-b border-red-100">
                                  <td className="py-2 px-3 font-medium">{error.row}</td>
                                  <td className="py-2 px-3">
                                    {error.data.name || '-'} / {error.data.email || '-'}
                                  </td>
                                  <td className="py-2 px-3">
                                    <ul className="list-disc list-inside text-red-600">
                                      {error.errors.map((err, i) => (
                                        <li key={i} className="text-xs">{err}</li>
                                      ))}
                                    </ul>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {importErrors.length > 10 && (
                          <div className="bg-red-50 px-3 py-2 text-xs text-red-600 text-center">
                            Và {importErrors.length - 10} lỗi khác...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* File Format Guide */}
                  {!importFile && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Định dạng file yêu cầu:</h4>
                      <div className="text-xs text-blue-800 space-y-1">
                        <p>• Cột 1: Tên (hoặc Name, Họ và tên)</p>
                        <p>• Cột 2: Email (hoặc Email Address, Địa chỉ email)</p>
                        <p>• Cột 3: Vai trò (Học sinh, Giáo viên, Quản lý, Quản trị viên)</p>
                        <p>• Cột 4: Trạng thái (Hoạt động, Tạm khóa) - Tùy chọn</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setImportPreview([]);
                      setImportErrors([]);
                      setShowAllPreview(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleImportConfirm}
                    disabled={importPreview.length === 0 || isImporting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Xác nhận Nhập ({importPreview.length})
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Create User Modal */}
        {
          showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Thêm Người dùng Mới</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tên người dùng"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Học sinh">Học sinh</option>
                      <option value="Giáo viên">Giáo viên</option>
                      <option value="Quản lý">Quản lý</option>
                      <option value="Quản trị viên">Quản trị viên</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Tạm khóa">Tạm khóa</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Save size={16} />
                    Tạo Người dùng
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Edit User Modal */}
        {
          showEditModal && editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa Người dùng</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tên người dùng"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Học sinh">Học sinh</option>
                      <option value="Giáo viên">Giáo viên</option>
                      <option value="Quản lý">Quản lý</option>
                      <option value="Quản trị viên">Quản trị viên</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Tạm khóa">Tạm khóa</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Save size={16} />
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}