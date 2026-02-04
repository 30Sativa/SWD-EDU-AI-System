import React, { useState, useRef, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Filter, Download, Upload, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Save, Power, PowerOff, MoreVertical, Mail, Shield, Activity, Eye, ChevronDown, User } from 'lucide-react';
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
          'Học sinh': ROLE_ENUM.STUDENT,
          'Giáo viên': ROLE_ENUM.TEACHER
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
    // Constraint checks
    if (!formData.name || formData.name.trim().length < 2) {
      return message.warning('Họ và tên phải có ít nhất 2 ký tự');
    }
    if (!formData.email) {
      return message.warning('Vui lòng nhập địa chỉ email');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return message.warning('Định dạng email không hợp lệ (VD: user@example.com)');
    }

    // Check for duplicate email in local list
    const isDuplicateEmail = users.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase());
    if (isDuplicateEmail) {
      return message.warning('Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.');
    }

    try {
      setIsLoading(true);

      // Define role mapping
      // Map role string to ID
      const ROLE_ID_MAP = {
        'Quản trị viên': ROLE_ENUM.ADMIN,
        'Quản lý': ROLE_ENUM.MANAGER,
        'Giáo viên': ROLE_ENUM.TEACHER,
        'Học sinh': ROLE_ENUM.STUDENT
      };

      const roleId = ROLE_ID_MAP[formData.role] || ROLE_ENUM.STUDENT;

      // Sanitize userName: use part before @, remove non-alphanumeric chars
      const safeUserName = formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

      // Try PascalCase to ensure backend matching if camelCase fails
      const payload = {
        FullName: formData.name,
        UserName: safeUserName,
        Email: formData.email,
        Password: '123456',
        Role: roleId
      };

      console.log("Creating user with payload:", payload);

      // Uniformly use createUser as Role ID is already in payload
      await createUser(payload);

      message.success('Tạo người dùng thành công!');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
      window.location.reload();

    } catch (error) {
      console.error("Create user failed:", error);

      let errorMsg = 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.';

      if (error.response) {
        // Server responded with a status code out of 2xx
        const serverData = error.response.data;

        if (serverData) {
          if (serverData.errors) {
            // Handle ASP.NET Core Validation Errors
            errorMsg = Object.values(serverData.errors).flat().join(' | ');
          } else if (serverData.message) {
            errorMsg = serverData.message;
          } else if (typeof serverData === 'string') {
            errorMsg = serverData;
          } else if (serverData.title) {
            errorMsg = serverData.title;
          }
        }

        if (error.response.status === 401) errorMsg = "Phiên làm việc hết hạn, vui lòng đăng nhập lại.";
        if (error.response.status === 403) errorMsg = "Bạn không có quyền thực hiện hành động này.";
        if (error.response.status === 409) errorMsg = "Email hoặc Tên đăng nhập đã tồn tại trong hệ thống.";
        if (error.response.status === 405) errorMsg = "Hệ thống không hỗ trợ phương thức tạo này (405). Hoặc sai đường dẫn API.";
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = "Không thể kết nối tới máy chủ. Vui lòng kiểm tra đường truyền mạng.";
      } else {
        errorMsg = error.message || "Lỗi khởi tạo yêu cầu.";
      }

      message.error(errorMsg, 5);
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


  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Hoạt động' ? false : true;
    const newStatusText = newStatus ? 'Hoạt động' : 'Tạm khóa';

    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatusText } : u));
    message.info(`Đã đổi trạng thái sang ${newStatusText} (Chưa lưu vào DB - cần API Backend)`);


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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0463ca]">Quản lý Người dùng</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Quản trị toàn bộ nhân sự, phân quyền và giám sát trạng thái tài khoản.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex-1 md:flex-none justify-center px-6 py-3 bg-white text-[#0487e2] font-bold rounded-xl border-2 border-[#0487e2]/10 hover:border-[#0487e2]/30 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <Upload size={18} strokeWidth={2.5} />
              <span className="whitespace-nowrap uppercase text-xs tracking-wider">Nhập dữ liệu</span>
            </button>
            <button
              onClick={() => {
                setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
                setShowCreateModal(true);
              }}
              className="flex-1 md:flex-none justify-center px-6 py-3 bg-[#0487e2] text-white font-bold rounded-xl hover:bg-[#0463ca] transition-all shadow-lg shadow-[#0487e2]/25 flex items-center gap-2 active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="whitespace-nowrap uppercase text-xs tracking-wider">Thêm người dùng</span>
            </button>
          </div>
        </header>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0487e2] transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc mã định danh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0487e2]/10 focus:border-[#0487e2] focus:bg-white transition-all placeholder-slate-400"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="pl-9 pr-8 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0487e2]/10 focus:border-[#0487e2] transition-all appearance-none cursor-pointer w-full sm:w-[180px]"
                >
                  <option>Tất cả Vai trò</option>
                  <option>Học sinh</option>
                  <option>Giáo viên</option>
                  <option>Quản lý</option>
                  <option>Quản trị viên</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-8 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0487e2]/10 focus:border-[#0487e2] transition-all appearance-none cursor-pointer w-full sm:w-[180px]"
                >
                  <option>Tất cả Trạng thái</option>
                  <option>Hoạt động</option>
                  <option>Tạm khóa</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative group w-full sm:w-auto">
                <button className="w-full sm:w-auto justify-center px-5 py-3 bg-[#f0f6fa] text-[#0487e2] font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#e0f2fe] transition-all flex items-center gap-2">
                  <Download size={16} strokeWidth={2.5} />
                  <span>Xuất dữ liệu</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 border-t-4 border-t-[#0487e2]">
                  <button onClick={handleExportCSV} className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" /> CSV
                  </button>
                  <button onClick={handleExportExcel} className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-slate-400" /> Excel
                  </button>
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
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-sm text-lg transition-transform group-hover:scale-110 ${user.role.match(/Admin|Quản trị/) ? 'bg-purple-100 text-purple-700' :
                            user.role.match(/Manager|Quản lý/) ? 'bg-orange-100 text-orange-700' :
                              user.role.match(/Teacher|Giáo viên/) ? 'bg-emerald-100 text-emerald-700' :
                                'bg-[#f0f6fa] text-[#0487e2]'
                            }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block group-hover:text-[#0487e2] transition-colors">{user.name}</span>
                            <span className="text-[11px] text-slate-400 font-bold tracking-tight uppercase">Mã: {user.id.toString().slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-300" />
                          <span className="text-sm text-slate-600 font-semibold">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${user.role.match(/Admin|Quản trị/) ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100/50' :
                          user.role.match(/Manager|Quản lý/) ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-100/50' :
                            user.role.match(/Teacher|Giáo viên/) ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/50' :
                              'bg-blue-50 text-blue-700 ring-1 ring-blue-100/50'
                          }`}>
                          <Shield size={10} strokeWidth={3} />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${user.status === 'Hoạt động' ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100' : 'text-rose-700 bg-rose-50 ring-1 ring-rose-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Hoạt động' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                          {user.status}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleToggleStatus(user)} className="p-2.5 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors" title="Đổi trạng thái">
                            {user.status === 'Hoạt động' ? <PowerOff size={18} /> : <Power size={18} />}
                          </button>
                          <button onClick={() => handleViewUser(user)} className="p-2.5 text-slate-400 hover:text-cyan-600 rounded-xl hover:bg-cyan-50 transition-colors" title="Xem chi tiết">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleEditUser(user)} className="p-2.5 text-slate-400 hover:text-[#0487e2] rounded-xl hover:bg-[#f0f6fa] transition-colors" title="Chỉnh sửa">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick(user)} className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors" title="Xóa tài khoản">
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
            <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-[#0463ca] tracking-tight">Nhập Dữ liệu Hệ thống</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium italic">Hỗ trợ các định dạng tiêu chuẩn: .csv, .xlsx, .xls</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white rounded-2xl transition-all shadow-sm">
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:border-[#0487e2]/30 hover:bg-[#f0f6fa]/30 transition-all cursor-pointer group relative overflow-hidden">
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-6 relative z-10">
                  {importFile ? (
                    <>
                      <div className="p-6 bg-white text-[#0487e2] rounded-[2rem] shadow-xl ring-8 ring-[#f0f6fa]"><FileSpreadsheet size={48} strokeWidth={1.5} /></div>
                      <div>
                        <p className="font-black text-xl text-slate-900 tracking-tight">{importFile.name}</p>
                        <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> {(importFile.size / 1024 / 1024).toFixed(2)} MB • Sẵn sàng đồng bộ
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-6 bg-white text-slate-300 group-hover:text-[#0487e2] rounded-[2rem] shadow-lg transition-all group-hover:shadow-blue-100"><Upload size={48} strokeWidth={1.5} /></div>
                      <div>
                        <p className="font-black text-xl text-slate-900 tracking-tight">Kéo thả hoặc chọn tệp tin</p>
                        <p className="text-sm text-slate-400 font-medium mt-2">Dung lượng tối đa 10MB cho mỗi lượt tải</p>
                      </div>
                      <div className="mt-4 px-6 py-2 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-full group-hover:bg-[#0487e2] group-hover:text-white transition-all">
                        Browse Files
                      </div>
                    </>
                  )}
                </label>
              </div>

              {importPreview.length > 0 && (
                <div className="bg-slate-50/80 rounded-[2rem] p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 tracking-tight uppercase text-xs">Phân tích dữ liệu</h4>
                        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Đã tìm thấy {importPreview.length} bản ghi hợp lệ</p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm max-h-[300px] custom-scrollbar">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest sticky top-0 z-10">
                        <tr>
                          <th className="px-5 py-4">Họ và tên</th>
                          <th className="px-5 py-4">Địa chỉ Email</th>
                          <th className="px-5 py-4">Vai trò</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {importPreview.slice(0, 50).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-slate-800 text-sm">{row.name}</td>
                            <td className="px-5 py-3.5 font-medium text-slate-500 text-sm italic">{row.email}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100 tracking-wider">
                                {row.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50/50 flex justify-end gap-4 border-t border-slate-100">
              <button onClick={() => setShowImportModal(false)} className="px-8 py-3 text-sm font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">Hủy bỏ</button>
              <button
                onClick={handleImportConfirm}
                disabled={importPreview.length === 0}
                className="px-10 py-3 bg-[#0487e2] text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#0463ca] shadow-xl shadow-[#0487e2]/30 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center gap-2"
              >
                Xác nhận đồng bộ <ArrowUpDown size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-white/20 overflow-hidden">
            {/* Header with Background Pattern */}
            <div className="relative px-8 pt-10 pb-20 bg-gradient-to-br from-[#0487e2] to-[#0463ca] text-white">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Users size={120} />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-xl font-black uppercase tracking-[0.2em]">Thông tin Chi tiết</h2>
                <div className="mt-6 w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] border-4 border-white/30 flex items-center justify-center shadow-2xl relative">
                  {isLoadingDetail ? <Spin /> : (
                    <span className="text-4xl font-black">{viewingUser?.fullName?.charAt(0) || viewingUser?.userName?.charAt(0) || 'U'}</span>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                    <Shield size={14} className="text-white" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-8 right-8 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-2xl transition-all"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            <div className="px-8 pb-10 -mt-10 relative z-20">
              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 space-y-8">
                {isLoadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-50 italic">
                    <p className="text-sm font-bold text-slate-400">Đang truy xuất thông tin...</p>
                  </div>
                ) : viewingUser ? (
                  <>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{viewingUser.fullName || viewingUser.userName}</h3>
                      <p className="text-slate-400 font-bold text-sm mt-1">{viewingUser.email}</p>

                      <div className="mt-4 inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                        {viewingUser.roleName}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã nhân sự</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{viewingUser.id.toString().slice(0, 15)}...</p>
                      </div>
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                        <div className={`flex items-center gap-2 text-sm font-black uppercase tracking-wider ${viewingUser.status === 'Hoạt động' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${viewingUser.status === 'Hoạt động' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                          {viewingUser.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[#f0f6fa]/50 rounded-2xl border border-blue-50">
                      <Mail size={18} className="text-[#0487e2]" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email liên hệ</p>
                        <p className="text-sm font-bold text-slate-700">{viewingUser.email}</p>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-50">
                      <span className="flex items-center gap-1"><Activity size={14} /> Gia nhập:</span>
                      <span className="text-slate-900 italic uppercase">{viewingUser.joinDate}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-slate-300 font-black italic">
                    DỮ LIỆU KHÔNG KHẢ DỤNG
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-12 py-3 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-white/20 overflow-hidden transform transition-all">
            {/* Header */}
            <div className="relative px-10 py-8 border-b border-slate-50 bg-[#f8fafc]/50">
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${showEditModal ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {showEditModal ? <Edit size={28} /> : <Plus size={28} />}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {showEditModal ? 'Cập nhật thành viên' : 'Hồ sơ nhân sự mới'}
                </h2>
                <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-wider">
                  {showEditModal ? 'Mã định danh: ' + editingUser.id.toString().slice(0, 8) : 'Thiết lập tham số hệ thống'}
                </p>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="absolute top-8 right-10 text-slate-300 hover:text-slate-600 hover:bg-white rounded-2xl p-2 transition-all shadow-sm"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-10 space-y-6">
              <div className="space-y-5">
                {/* Name Input */}
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.1em] ml-4 transition-colors group-focus-within:text-[#0487e2]">Họ và tên hiển thị</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#0487e2] transition-all">
                      <User size={20} strokeWidth={2.5} />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#0487e2]/5 focus:border-[#0487e2] outline-none font-black text-slate-800 transition-all placeholder-slate-200 text-sm"
                      placeholder="NGUYỄN VĂN A"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.1em] ml-4 transition-colors group-focus-within:text-[#0487e2]">Định danh Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#0487e2] transition-all">
                      <Mail size={20} strokeWidth={2.5} />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      disabled={showEditModal}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#0487e2]/5 focus:border-[#0487e2] outline-none font-bold text-slate-800 transition-all placeholder-slate-200 text-sm disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      placeholder="EXAMPLE@DOMAIN.COM"
                    />
                  </div>
                </div>

                {/* Row: Role & Status */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.1em] ml-4 transition-colors group-focus-within:text-[#0487e2]">Phân quyền</label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-[#0487e2]/5 focus:border-[#0487e2] appearance-none transition-all cursor-pointer hover:bg-white uppercase tracking-wider"
                      >
                        <option value="Học sinh">Học sinh</option>
                        <option value="Giáo viên">Giáo viên</option>
                        <option value="Quản lý">Quản lý</option>
                        <option value="Quản trị viên">Quản trị viên</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0487e2]">
                        <ChevronDown size={20} strokeWidth={3} />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.1em] ml-4 transition-colors group-focus-within:text-[#0487e2]">Tình trạng</label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-[#0487e2]/5 focus:border-[#0487e2] appearance-none transition-all cursor-pointer hover:bg-white uppercase tracking-wider"
                      >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Tạm khóa">Tạm khóa</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0487e2]">
                        <ChevronDown size={20} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-10 bg-[#f8fafc]/50 border-t border-slate-50 flex justify-end gap-5">
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="px-8 py-3 text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-[0.2em]"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isLoading}
                onClick={showEditModal ? handleSaveEdit : handleCreateUser}
                className={`px-12 py-3 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 transform active:scale-95 disabled:opacity-50 disabled:cursor-wait ${showEditModal ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-[#0487e2] hover:bg-[#0463ca] shadow-blue-200'}`}
              >
                {isLoading ? <Spin size="small" /> : <Save size={18} strokeWidth={2.5} />}
                <span>{isLoading ? 'Đang xử lý...' : (showEditModal ? 'Cập nhật' : 'Khởi tạo')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full border border-white/20 overflow-hidden transform transition-all scale-100">
            <div className="relative px-8 pt-12 pb-8 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-rose-50/50">
                <AlertCircle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Xóa tài khoản vĩnh viễn?</h3>
              <p className="text-slate-400 font-bold mb-8 text-xs uppercase tracking-widest leading-relaxed">
                Hành động này <span className="text-rose-600">không thể hoàn tác</span>. Vui lòng xác nhận email bên dưới:
                <br />
                <span className="text-slate-900 text-sm lowercase mt-2 block tracking-normal">{deletingUser.email}</span>
              </p>

              <div className="relative mb-8 group">
                <input
                  type="text"
                  value={deleteConfirmationInput}
                  onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                  placeholder="Nhập email để xác nhận..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold text-slate-800 transition-all text-center placeholder-slate-200 text-sm"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmationInput !== deletingUser.email}
                  className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-rose-700 shadow-xl shadow-rose-200 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Trash2 size={18} strokeWidth={2.5} />
                  Xác nhận xóa tài khoản
                </button>
                <button
                  onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }}
                  className="w-full py-3 bg-white text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
                >
                  Tôi muốn giữ lại tài khoản này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}