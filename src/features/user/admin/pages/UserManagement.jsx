import React, { useState, useRef, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Filter, Download, Upload, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Save, Power, PowerOff, MoreVertical, Mail, Shield, Activity, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { message, Spin } from 'antd';
import { getUsers, getRoleName, ROLE_ENUM, getUserById, deleteUser, createUser, createStudent, createTeacher, createAdmin, createManager, updateUserProfile } from "../../api/userApi";

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
  const [showDetailModal, setShowDetailModal] = useState(false); // New state
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null); // New state
  const [isLoadingDetail, setIsLoadingDetail] = useState(false); // New state
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
        const ROLE_FILTER_MAP = {
          'Quản trị viên': ROLE_ENUM.ADMIN,
          'Quản lý': ROLE_ENUM.MANAGER,
          'Học sinh': ROLE_ENUM.USER,
          'Giáo viên': ROLE_ENUM.USER
        };

        const STATUS_FILTER_MAP = {
          'Hoạt động': true,
          'Tạm khóa': false
        };

        const params = {
          SearchTerm: searchTerm || null,
          RoleFilter: ROLE_FILTER_MAP[filterRole] ?? null,
          IsActiveFilter: STATUS_FILTER_MAP[filterStatus] ?? null,
          Page: 1,
          PageSize: 100
        };

        const response = await getUsers(params);
        let rawItems = [];
        if (Array.isArray(response)) {
          rawItems = response;
        } else if (response && Array.isArray(response.items)) {
          rawItems = response.items;
        } else if (response && Array.isArray(response.data)) {
          rawItems = response.data;
        } else if (response && response.data && Array.isArray(response.data.items)) {
          rawItems = response.data.items;
        }

        const mappedUsers = rawItems.map(u => ({
          id: u.id,
          name: u.fullName || u.userName || 'No Name',
          email: u.email || u.userName,
          role: getRoleName(u.role),
          status: u.isActive ? 'Hoạt động' : 'Tạm khóa',
          joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filterRole, filterStatus]);

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
      if (sortField === 'joinDate') {
        aValue = new Date(aValue.split('/').reverse().join('-'));
        bValue = new Date(bValue.split('/').reverse().join('-'));
      }
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
      return <ArrowUpDown size={14} className="text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-[#0487e2]" />
    ) : (
      <ArrowDown size={14} className="text-[#0487e2]" />
    );
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
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
            i++;
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

  const normalizeImportedData = (rawData) => {
    return rawData.map((row, index) => {
      const name = row.name || row.tên || row.Name || row.Tên || row['Họ và tên'] || '';
      const email = row.email || row.Email || row['Email Address'] || row['Địa chỉ email'] || '';
      const role = row.role || row.vaitro || row.Role || row['Vai trò'] || 'Học sinh';
      const status = row.status || row.trangthai || row.Status || row['Trạng thái'] || 'Hoạt động';
      return {
        name: name.toString().trim(),
        email: email.toString().trim().toLowerCase(),
        role: role.toString().trim(),
        status: status.toString().trim(),
        rowIndex: index + 2,
      };
    });
  };

  const validateImportedData = (normalizedData) => {
    const errors = [];
    const validData = [];
    normalizedData.forEach((row, index) => {
      const rowErrors = [];
      if (!row.name || row.name.length === 0) rowErrors.push('Thiếu tên');
      if (!row.email || row.email.length === 0) {
        rowErrors.push('Thiếu email');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        rowErrors.push('Email không hợp lệ');
      }
      const existingUser = users.find(u => u.email.toLowerCase() === row.email.toLowerCase());
      if (existingUser) rowErrors.push('Email đã tồn tại trong hệ thống');
      const duplicateInImport = normalizedData.slice(0, index).find(r => r.email.toLowerCase() === row.email.toLowerCase());
      if (duplicateInImport) rowErrors.push('Email trùng lặp trong file');
      const validRoles = ['Học sinh', 'Giáo viên', 'Quản lý', 'Quản trị viên'];
      if (!validRoles.includes(row.role)) rowErrors.push(`Vai trò không hợp lệ`);
      if (rowErrors.length > 0) {
        errors.push({ row: row.rowIndex, data: row, errors: rowErrors });
      } else {
        validData.push(row);
      }
    });
    return { validData, errors };
  };

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
        alert('Định dạng file không được hỗ trợ.');
        setIsImporting(false);
        return;
      }
      const normalizedData = normalizeImportedData(rawData);
      const { validData, errors } = validateImportedData(normalizedData);
      setImportPreview(validData);
      setImportErrors(errors);
    } catch (error) {
      console.error('Error parsing file:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportConfirm = () => {
    if (importPreview.length === 0) return;
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert(`Đã thêm thành công ${newUsers.length} người dùng!`);
  };

  const handleExportCSV = () => {
    const csvContent = [['Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tham gia'], ...filteredAndSortedUsers.map(user => [user.name, user.email, user.role, user.status, user.joinDate])].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    const worksheetData = [['Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tham gia'], ...filteredAndSortedUsers.map(user => [user.name, user.email, user.role, user.status, user.joinDate])];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users_export.xlsx`);
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) return message.warning('Vui lòng điền đủ thông tin');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return message.warning('Email không hợp lệ');

    try {
      setIsLoading(true);

      // Define role mapping
      // Map role string to ID
      const ROLE_ID_MAP = {
        'Quản trị viên': ROLE_ENUM.ADMIN,
        'Quản lý': ROLE_ENUM.MANAGER,
        'Giáo viên': ROLE_ENUM.USER,
        'Học sinh': ROLE_ENUM.USER
      };

      const roleId = ROLE_ID_MAP[formData.role] || ROLE_ENUM.USER;

      // Sanitize userName: use part before @, remove non-alphanumeric chars
      const safeUserName = formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

      // Try PascalCase to ensure backend matching if camelCase fails
      const payload = {
        FullName: formData.name,
        UserName: safeUserName,
        Email: formData.email,
        Password: 'Password123!',
        Role: roleId
      };

      console.log("Creating user with payload (PascalCase):", payload);

      // Map role to specific API creation function
      const CREATE_API_MAP = {
        'Học sinh': createUser, // Fallback to generic
        'Giáo viên': createUser, // Fallback to generic
        'Quản lý': createManager,
        'Quản trị viên': createAdmin
      };

      const createApiFn = CREATE_API_MAP[formData.role] || createUser;
      await createApiFn(payload);

      message.success('Tạo người dùng thành công!');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
      window.location.reload();

    } catch (error) {
      console.error("Create user failed:", error);

      let errorMsg = 'Tạo người dùng thất bại.';
      let debugInfo = '';

      if (error.response?.data) {
        console.error("Error Response Data:", error.response.data);
        debugInfo = JSON.stringify(error.response.data, null, 2);

        if (error.response.data.errors) {
          errorMsg = Object.values(error.response.data.errors).flat().join('\n');
        } else if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.title) {
          errorMsg = error.response.data.title;
        }
      }

      message.error(errorMsg);
      // Optional: Alert for immediate visibility if message is missed
      // alert(`Debug Error: ${debugInfo || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    if (!formData.name || !formData.email) return;
    setUsers(users.map(user => user.id === editingUser.id ? { ...user, name: formData.name, email: formData.email.toLowerCase(), role: formData.role, status: formData.status } : user));
    setShowEditModal(false);
    setEditingUser(null);
  };

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  // Toggle user status (Active/Inactive)
  const handleToggleStatus = async (user) => {
    // NOTE: Backend API 'updateUserProfile' does NOT support changing IsActive status.
    // We are simulating this on Frontend for now or waiting for a specific Lock/Unlock API.

    const newStatus = user.status === 'Hoạt động' ? false : true;
    const newStatusText = newStatus ? 'Hoạt động' : 'Tạm khóa';

    // UI Optimistic Update only
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatusText } : u));
    message.info(`Đã đổi trạng thái sang ${newStatusText} (Chưa lưu vào DB - cần API Backend)`);

    /* 
    // OLD CODE - Re-enable when Backend supports status update
    try {
        await updateUserProfile(user.id, { IsActive: newStatus });
        message.success(`Đã chuyển trạng thái sang ${newStatusText}`);
    } catch (error) { ... }
    */
  };

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setDeleteConfirmationInput('');
    setShowDeleteModal(true);
  };


  const handleSaveEdit = async () => {
    if (!formData.name) return message.warning("Vui lòng nhập tên");

    try {
      setIsLoading(true);

      // API only supports updating Profile basic info (FullName, Phone, Address...)
      // It does NOT support updating Role, Email, or Status directly.

      const payload = {
        FullName: formData.name,
        // User can define other fields like PhoneNumber here if form had them
      };

      await updateUserProfile(editingUser.id, payload);

      // Update local state
      setUsers(users.map(user => user.id === editingUser.id ? {
        ...user,
        name: formData.name
        // Keep old Role/Status/Email as they weren't changed on server
      } : user));

      message.success("Cập nhật thông tin thành công");
      if (formData.role !== editingUser.role || formData.status !== editingUser.status) {
        message.warning("Lưu ý: Vai trò và Trạng thái chưa thể thay đổi qua API này.");
      }

      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Update user failed:", error);
      message.error("Cập nhật thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    if (deleteConfirmationInput !== deletingUser.email) {
      message.error('Email xác nhận không khớp!');
      return;
    }

    try {
      setIsLoading(true);
      await deleteUser(deletingUser.id);
      setUsers(users.filter(u => u.id !== deletingUser.id));
      message.success('Xóa người dùng thành công');
      setShowDeleteModal(false);
      setDeletingUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      message.error('Xóa người dùng thất bại');
    } finally {
      setIsLoading(false);
    }
  };


  const handleViewUser = async (user) => {
    setViewingUser(null);
    setShowDetailModal(true);
    setIsLoadingDetail(true);
    try {
      const response = await getUserById(user.id);
      const userData = response.data || response; // Adapt to likely response structure

      // Ensure consistent structure for display
      setViewingUser({
        ...userData,
        roleName: getRoleName(userData.role),
        status: userData.isActive ? 'Hoạt động' : 'Tạm khóa',
        joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('vi-VN') : '-'
      });
    } catch (error) {
      console.error("Failed to fetch user detail:", error);
      message.error("Không thể tải thông tin chi tiết");
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Người dùng</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý tài khoản, phân quyền và trạng thái hệ thống.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex-1 md:flex-none justify-center px-5 py-2.5 bg-white text-[#0487e2] font-semibold rounded-lg border border-[#0487e2] hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Upload size={18} />
              <span className="whitespace-nowrap">Nhập File</span>
            </button>
            <button
              onClick={() => {
                setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
                setShowCreateModal(true);
              }}
              className="flex-1 md:flex-none justify-center px-5 py-2.5 bg-[#0487e2] text-white font-semibold rounded-lg hover:bg-[#0463ca] transition-all shadow-md shadow-[#0487e2]/20 flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="whitespace-nowrap">Thêm Người dùng</span>
            </button>
          </div>
        </header>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 w-full sm:w-auto"
              >
                <option>Tất cả Vai trò</option>
                <option>Học sinh</option>
                <option>Giáo viên</option>
                <option>Quản lý</option>
                <option>Quản trị viên</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 w-full sm:w-auto"
              >
                <option>Tất cả Trạng thái</option>
                <option>Hoạt động</option>
                <option>Tạm khóa</option>
              </select>
              <div className="relative group w-full sm:w-auto">
                <button className="w-full sm:w-auto justify-center px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all flex items-center gap-2">
                  <Download size={16} />
                  <span>Xuất dữ liệu</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button onClick={handleExportCSV} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 rounded-t-xl text-slate-700">File CSV</button>
                  <button onClick={handleExportExcel} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 rounded-b-xl text-slate-700">File Excel</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spin size="large" />
              <p className="mt-4 text-slate-500 font-medium">Đang đồng bộ dữ liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-[#0487e2]">
                        Người dùng {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-6 py-4">
                      <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-[#0487e2]">
                        Email {getSortIcon('email')}
                      </button>
                    </th>
                    <th className="px-6 py-4">
                      <button onClick={() => handleSort('role')} className="flex items-center gap-1 hover:text-[#0487e2]">
                        Vai trò {getSortIcon('role')}
                      </button>
                    </th>
                    <th className="px-6 py-4">
                      <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-[#0487e2]">
                        Trạng thái {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#f0f6fa] text-[#0487e2] flex items-center justify-center font-bold shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.role.match(/Admin|Quản trị/) ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100' :
                          user.role.match(/Manager|Quản lý/) ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-100' :
                            user.role.match(/Teacher|Giáo viên/) ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' :
                              'bg-blue-50 text-blue-700 text-center ring-1 ring-blue-100'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleToggleStatus(user)} className="p-2 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors" title="Đổi trạng thái">
                            {user.status === 'Hoạt động' ? <PowerOff size={18} /> : <Power size={18} />}
                          </button>
                          <button onClick={() => handleViewUser(user)} className="p-2 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors" title="Xem chi tiết">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleEditUser(user)} className="p-2 text-slate-400 hover:text-[#0487e2] rounded-lg hover:bg-[#f0f6fa] transition-colors" title="Sửa">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick(user)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Xóa">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAndSortedUsers.length === 0 && (
                <div className="text-center py-20 bg-white">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold">Không tìm thấy kết quả phù hợp</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS SYNCED STYLE --- */}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-[#0463ca]">Nhập Dữ liệu Hệ thống</h2>
                <p className="text-xs text-slate-500 mt-1">Hỗ trợ định dạng chuẩn .csv, .xlsx, .xls</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-[#0487e2] hover:bg-[#f0f6fa]/50 transition-all cursor-pointer group">
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  {importFile ? (
                    <>
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm"><FileSpreadsheet size={40} /></div>
                      <div>
                        <p className="font-bold text-slate-900">{importFile.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(importFile.size / 1024).toFixed(2)} KB • Sẵn sàng xử lý</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-50 text-slate-400 group-hover:text-[#0487e2] rounded-2xl transition-all"><Upload size={40} /></div>
                      <div>
                        <p className="font-bold text-slate-900">Kéo thả file vào đây hoặc nhấp để chọn</p>
                        <p className="text-xs text-slate-500 mt-1">Tối đa 10MB mỗi tệp tin</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {importPreview.length > 0 && (
                <div className="bg-[#f0f6fa] rounded-2xl p-5 border border-[#e0f2fe]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-bold text-[#0463ca]">
                      <CheckCircle size={18} /> <span>Dữ liệu hợp lệ ({importPreview.length})</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto bg-white rounded-xl border border-slate-100 max-h-64">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                        <tr><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Vai trò</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {importPreview.slice(0, 10).map((row, i) => (
                          <tr key={i}><td className="px-4 py-2 font-bold">{row.name}</td><td className="px-4 py-2">{row.email}</td><td className="px-4 py-2 font-semibold text-[#0487e2]">{row.role}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setShowImportModal(false)} className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all">Hủy bỏ</button>
              <button onClick={handleImportConfirm} disabled={importPreview.length === 0} className="px-6 py-2 bg-[#0487e2] text-white font-bold rounded-xl text-sm hover:bg-[#0463ca] shadow-md shadow-[#0487e2]/20 disabled:opacity-50 transition-all">
                Xác nhận Nhập dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden scale-100 transition-all">
            {/* Header */}
            <div className="relative px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">Thông tin chi tiết</h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-all"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-8">
              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Spin />
                  <p className="mt-4 text-slate-500 text-sm">Đang tải thông tin...</p>
                </div>
              ) : viewingUser ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center pb-6 border-b border-slate-50">
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
                      {viewingUser.fullName?.charAt(0) || viewingUser.userName?.charAt(0) || 'U'}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{viewingUser.fullName || viewingUser.userName}</h3>
                    <p className="text-slate-500 text-sm">{viewingUser.email}</p>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${viewingUser.roleName === 'Quản trị viên' ? 'bg-purple-100 text-purple-700' :
                      viewingUser.roleName === 'Quản lý' ? 'bg-orange-100 text-orange-700' :
                        viewingUser.roleName === 'Giáo viên' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                      {viewingUser.roleName}
                    </span>
                  </div>

                  <div className="space-y-4 text-sm mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 font-medium mb-1 uppercase text-xs">ID Người dùng</p>
                        <p className="font-semibold text-slate-700 truncate" title={viewingUser.id}>{viewingUser.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium mb-1 uppercase text-xs">Trạng thái</p>
                        <span className={`inline-flex items-center gap-1.5 font-bold ${viewingUser.status === 'Hoạt động' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <span className={`w-2 h-2 rounded-full ${viewingUser.status === 'Hoạt động' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {viewingUser.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 font-medium mb-1 uppercase text-xs">Ngày tham gia</p>
                        <p className="font-semibold text-slate-700">{viewingUser.joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  Không có dữ liệu
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden scale-100 transition-all">
            {/* Header */}
            <div className="relative px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">
                  {showEditModal ? 'Cập nhật Thông tin' : 'Thêm Người dùng Mới'}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  {showEditModal ? 'Chỉnh sửa thông tin thành viên hiện tại' : 'Tạo hồ sơ thành viên mới vào hệ thống'}
                </p>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Name Input */}
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider ml-1">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0487e2] transition-colors">
                      <Users size={18} />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] outline-none font-semibold text-slate-700 transition-all placeholder-slate-400"
                      placeholder="Nhập tên hiển thị..."
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider ml-1">Email định danh</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0487e2] transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] outline-none font-medium text-slate-700 transition-all placeholder-slate-400"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                {/* Row: Role & Status */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider ml-1">Vai trò</label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] appearance-none transition-all cursor-pointer hover:bg-white"
                      >
                        <option value="Học sinh">Học sinh</option>
                        <option value="Giáo viên">Giáo viên</option>
                        <option value="Quản lý">Quản lý</option>
                        <option value="Quản trị viên">Quản trị viên</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 bg-transparent">
                        <ArrowDown size={16} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider ml-1">Trạng thái</label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] appearance-none transition-all cursor-pointer hover:bg-white"
                      >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Tạm khóa">Tạm khóa</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 bg-transparent">
                        <ArrowDown size={16} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={showEditModal ? handleUpdateUser : handleCreateUser}
                className={`px-8 py-2.5 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform active:scale-95 ${showEditModal ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#0487e2] hover:bg-[#0463ca]'}`}
              >
                <Save size={18} />
                <span>{showEditModal ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa tài khoản?</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Hành động này không thể hoàn tác. Để xác nhận, vui lòng nhập email của người dùng <span className="font-bold text-slate-700">{deletingUser.email}</span> vào ô bên dưới.
              </p>

              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="Nhập email xác nhận..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none font-medium text-slate-700 transition-all mb-6 text-center placeholder-slate-400"
              />

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmationInput !== deletingUser.email}
                  className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-sm hover:bg-rose-700 shadow-lg shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Xóa người dùng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}