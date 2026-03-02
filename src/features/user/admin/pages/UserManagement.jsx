import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { Users, Search, Plus, Edit, Trash2, Filter, Download, Upload, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle, AlertTriangle, FileSearch, ArrowUpDown, ArrowUp, ArrowDown, Save, Power, PowerOff, MoreVertical, MoreHorizontal, Mail, Shield, Activity, Eye, ChevronDown, ChevronLeft, ChevronRight, User, Phone, MapPin, ArrowUpRight, GraduationCap, Calendar, UserCircle, Hash, AlignLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { message, Spin, Button, Input, Modal, Form, Select, Tooltip, Empty, Tag, Card, DatePicker, Radio, Pagination } from 'antd';
// Đảm bảo đường dẫn import API này đúng với cấu trúc dự án của bạn
import { getUsers, getRoleName, ROLE_ENUM, getUserById, deleteUser, createUser, updateUserProfile, importUsers } from "../../api/userApi";

export default function UserManagement() {
  // --- STATES ---
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Data states
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Import states
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Delete confirm input
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Học sinh',
    status: 'Hoạt động',
    phoneNumber: '',
    dateOfBirth: null,
    gender: 'Nam',
    address: '',
    bio: ''
  });

  // --- API & LOGIC ---

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
        const STATUS_FILTER_MAP = { 'Hoạt động': true, 'Tạm khóa': false };

        const params = {
          SearchTerm: searchTerm || null,
          RoleFilter: ROLE_FILTER_MAP[filterRole] ?? null,
          IsActiveFilter: STATUS_FILTER_MAP[filterStatus] ?? null,
          Page: currentPage,
          PageSize: pageSize
        };

        const response = await getUsers(params);
        let rawItems = [];
        let totalCount = 0;

        // Xử lý các dạng response khác nhau của backend
        if (response?.data?.items) {
          rawItems = response.data.items;
          totalCount = response.data.totalCount || response.data.totalItems || 0;
        } else if (response?.items) {
          rawItems = response.items;
          totalCount = response.totalCount || response.totalItems || 0;
        } else if (response?.data) {
          rawItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
          totalCount = response.data.totalCount || response.data.totalItems || rawItems.length;
        } else if (Array.isArray(response)) {
          rawItems = response;
          totalCount = response.length;
        }

        const mappedUsers = rawItems.map(u => ({
          id: u.id,
          // Kiểm tra đa dạng các trường hợp (camelCase, PascalCase) từ cả profile và object gốc
          name: u.fullName || u.profile?.fullName || u.userName || u.email?.replace(/@.*$/, '') || 'Thành viên',
          email: u.email || u.userName || "",
          role: getRoleName(u.role),
          status: u.isActive ? 'Hoạt động' : 'Tạm khóa',
          joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '-'
        }));

        setUsers(mappedUsers);
        setTotalUsers(totalCount);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterRole, filterStatus, currentPage, pageSize]);

  // Sorting Logic
  const filteredAndSortedUsers = users.sort((a, b) => {
    if (!sortField) return 0;
    let aValue = a[sortField];
    let bValue = b[sortField];
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
    if (sortField !== field) return <div className="w-3 h-3" />; // Placeholder giữ chỗ
    return sortDirection === 'asc' ? <ArrowUp size={14} className="text-[#0487e2]" /> : <ArrowDown size={14} className="text-[#0487e2]" />;
  };

  // --- IMPORT / EXPORT LOGIC (Giữ nguyên logic cũ) ---
  const parseCSV = (text) => { /* ... Logic CSV cũ ... */
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((h, idx) => row[h] = values[idx]);
        data.push(row);
      }
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
        } catch (error) { reject(error); }
      };
      reader.readAsArrayBuffer(file);
    });
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
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        rawData = parseCSV(text);
      } else {
        rawData = await parseExcel(file);
      }

      if (rawData.length === 0) {
        message.error("File trống hoặc không đúng định dạng");
        return;
      }

      // 1. Phải lấy danh sách thực tế để check trùng chính xác
      const allUsersRes = await getUsers({ Page: 1, PageSize: 100 });
      const rawAllUsers = allUsersRes?.data?.items || allUsersRes?.items || allUsersRes?.data || [];
      const serverUsers = Array.isArray(rawAllUsers) ? rawAllUsers : [];
      const localUsersList = Array.isArray(users) ? users : [];

      const existingIdentifiers = [...serverUsers, ...localUsersList].map(u => [
        (u.email || u.Email || "").toLowerCase().trim(),
        (u.userName || u.UserName || "").toLowerCase().trim()
      ]).flat().filter(e => e !== "");

      const emailsSeenInFile = new Set();
      const errors = [];
      const normalizedData = rawData.map((row, index) => {
        const rowErrors = [];
        // Nhận diện tên linh hoạt
        const name = (
          row.fullName || row['Họ và tên'] || row['Họ tên'] || row['Họ Và Tên'] ||
          row.name || row['Name'] || row['Full Name'] || row['FullName'] || ""
        ).toString().trim();

        // Nhận diện email linh hoạt
        const emailRaw = (
          row.email || row['Email'] || row['email'] || row['Email hệ thống'] ||
          row['E-mail'] || row['Tên đăng nhập'] || row['Username'] || ""
        ).toString().trim();
        const lowerEmail = emailRaw.toLowerCase();

        const role = row.role || row['Vai trò'] || 'Học sinh';
        const ROLE_MAP = { 'Quản trị viên': 1, 'Quản lý': 2, 'Giáo viên': 3, 'Học sinh': 4 };
        const roleId = ROLE_MAP[role] || 4;
        const status = 'Hoạt động';

        if (!name) rowErrors.push("Thiếu Họ và tên");
        if (!emailRaw) rowErrors.push("Thiếu Email");
        else {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) rowErrors.push("Email sai định dạng");
          if (lowerEmail && existingIdentifiers.includes(lowerEmail)) rowErrors.push("Email đã tồn tại");
          if (lowerEmail && emailsSeenInFile.has(lowerEmail)) rowErrors.push("Email bị lặp trong file");
          if (lowerEmail) emailsSeenInFile.add(lowerEmail);
        }

        if (rowErrors.length > 0) errors.push({ row: index + 1, messages: rowErrors });

        return {
          name: name || 'NULL',
          email: emailRaw || 'NULL',
          roleId: roleId,
          role: role,
          status: status,
          errors: rowErrors,
          isDuplicate: lowerEmail && existingIdentifiers.includes(lowerEmail)
        };
      });

      setImportPreview(normalizedData);
      setImportErrors(errors);

      if (errors.length > 0) {
        message.warning(`Phát hiện ${errors.length} dòng dữ liệu có lỗi. Vui lòng kiểm tra lại.`);
      }
    } catch (error) {
      message.error("Lỗi khi đọc file: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportConfirm = async () => {
    const validRows = importPreview.filter(row => row.errors.length === 0);
    if (validRows.length === 0) return message.warning("Không có dữ liệu hợp lệ để nhập");

    setIsImporting(true);
    const hide = message.loading("Đang lọc và xử lý dữ liệu hợp lệ...", 0);
    try {
      // Luôn tạo file mới từ dữ liệu đã được chuẩn hóa để đảm bảo các giá trị mặc định (Học sinh, Hoạt động)
      const cleanData = validRows.map(r => ({
        "Email": r.email,
        "FullName": r.name,
        "UserName": r.email,
        "Role": r.role,
        "Status": r.status
      }));
      const ws = XLSX.utils.json_to_sheet(cleanData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const fileToUpload = new File([excelBuffer], `processed_${importFile.name.split('.')[0]}.xlsx`, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      await importUsers(fileToUpload);
      message.success(`Đã nhập thành công ${validRows.length} người dùng hợp lệ`);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      setImportErrors([]);
      window.location.reload();
    } catch (error) {
      let errorMsg = error.message;
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') errorMsg = data;
        else if (data.message || data.Message) errorMsg = data.message || data.Message;
        else if (data.error || data.Error) errorMsg = data.error || data.Error;
        else if (data.detail || data.Detail) errorMsg = data.detail || data.Detail;
        else if (data.errors) errorMsg = Object.values(data.errors).flat().join(', ');
      }
      message.error("Lỗi khi nhập file: " + errorMsg);
    } finally {
      hide();
      setIsImporting(false);
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users_export.xlsx`);
  };

  // --- CRUD HANDLERS ---
  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) return message.warning('Vui lòng nhập đủ thông tin');

    // Ràng buộc format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return message.error('Định dạng email không hợp lệ (ví dụ: user@example.com)');
    }

    setIsLoading(true);
    try {
      const ROLE_ID_MAP = {
        'Quản trị viên': ROLE_ENUM.ADMIN,
        'Quản lý': ROLE_ENUM.MANAGER,
        'Giáo viên': ROLE_ENUM.TEACHER,
        'Học sinh': ROLE_ENUM.STUDENT
      };

      const payload = {
        fullName: formData.name,
        email: formData.email,
        password: 'Password123!', // Mặc định hoặc có thể thêm field cho user nhập
        role: ROLE_ID_MAP[formData.role] || ROLE_ENUM.STUDENT
      };

      await createUser(payload);
      message.success('Tạo tài khoản thành công');
      setShowCreateModal(false);
      setFormData({
        name: '', email: '', role: 'Học sinh', status: 'Hoạt động',
        phoneNumber: '', dateOfBirth: null, gender: 'Nam', address: '', bio: ''
      });
      window.location.reload();
    } catch (error) {
      let errorMsg = error.message;
      if (error.response?.data) {
        const data = error.response.data;
        // Kiểm tra tất cả các trường hợp phổ biến của Backend (.NET, Java, v.v.)
        if (typeof data === 'string') errorMsg = data;
        else if (data.message || data.Message) errorMsg = data.message || data.Message;
        else if (data.error || data.Error) errorMsg = data.error || data.Error;
        else if (data.detail || data.Detail) errorMsg = data.detail || data.Detail;
        else if (data.title || data.Title) errorMsg = data.title || data.Title;
        else if (data.errors) errorMsg = Object.values(data.errors).flat().join(', ');
      }
      message.error('Tạo tài khoản thất bại: ' + errorMsg);
    }
    finally { setIsLoading(false); }
  };

  const handleSaveEdit = async () => {
    if (!formData.name) return message.warning("Nhập tên");
    setIsLoading(true);
    try {
      const GENDER_MAP = {
        'Nam': 'Male',
        'Nữ': 'Female',
        'Khác': 'Other'
      };

      const profilePayload = {
        Id: editingUser.id,
        FullName: formData.name || "",
        PhoneNumber: formData.phoneNumber || "",
        Gender: GENDER_MAP[formData.gender] || formData.gender || "Other",
        Address: formData.address || "",
        Bio: formData.bio || ""
      };

      if (formData.dateOfBirth) {
        profilePayload.DateOfBirth = formData.dateOfBirth.format('YYYY-MM-DD');
      }

      console.log("Updating profile with Final PascalCase Payload:", profilePayload);
      await updateUserProfile(editingUser.id, profilePayload);
      message.success("Cập nhật thông tin thành công");
      setShowEditModal(false);
      // Refresh list
      window.location.reload();
    } catch (error) {
      let errorMsg = error.message;
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') errorMsg = data;
        else if (data.message || data.Message) errorMsg = data.message || data.Message;
        else if (data.error || data.Error) errorMsg = data.error || data.Error;
        else if (data.detail || data.Detail) errorMsg = data.detail || data.Detail;
        else if (data.errors) errorMsg = Object.values(data.errors).flat().join(', ');
      }
      message.error("Lỗi cập nhật: " + errorMsg);
    }
    finally { setIsLoading(false); }
  };

  const handleEditUser = async (user) => {
    setIsLoading(true);
    try {
      const res = await getUserById(user.id);
      const data = res.data?.data || res.data || res;
      setEditingUser(data);
      const GENDER_REVERSE_MAP = {
        'Male': 'Nam',
        'Female': 'Nữ',
        'Other': 'Khác'
      };

      setFormData({
        name: data.fullName || data.profile?.fullName || data.userName || '',
        email: data.email || '',
        role: getRoleName(data.role),
        status: data.isActive ? 'Hoạt động' : 'Tạm khóa',
        phoneNumber: data.profile?.phoneNumber || '',
        dateOfBirth: data.profile?.dateOfBirth ? (data.profile.dateOfBirth.includes('T') ? dayjs(data.profile.dateOfBirth) : dayjs(data.profile.dateOfBirth)) : null,
        gender: GENDER_REVERSE_MAP[data.profile?.gender] || data.profile?.gender || 'Nam',
        address: data.profile?.address || '',
        bio: data.profile?.bio || ''
      });
      setShowEditModal(true);
    } catch (error) {
      message.error("Không thể tải thông tin người dùng để chỉnh sửa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setDeleteConfirmationInput('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmationInput !== deletingUser?.email) return message.error('Email không khớp!');
    setIsLoading(true);
    try {
      await deleteUser(deletingUser.id);
      setUsers(users.filter(u => u.id !== deletingUser.id));
      message.success('Đã xóa');
      setShowDeleteModal(false);
    } catch (e) { message.error('Xóa thất bại'); }
    finally { setIsLoading(false); }
  };

  const handleToggleStatus = (user) => {
    // Mock update local only
    const newStatus = user.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    message.info(`Đã chuyển trạng thái: ${newStatus}`);
  };

  const handleViewUser = async (user) => {
    setViewingUser(null);
    setShowDetailModal(true);
    setIsLoadingDetail(true);
    try {
      const res = await getUserById(user.id);
      // Backend trả về: { success, message, data: { id, email, role, isActive, profile: { fullName, ... } } }
      const data = res.data?.data || res.data || res;

      setViewingUser({
        ...data,
        displayName: data.fullName || data.profile?.fullName || data.userName || data.email?.replace(/@.*$/, ''),
        roleName: getRoleName(data.role),
        status: data.isActive ? 'Hoạt động' : 'Tạm khóa',
        joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : '-',
        // Đảm bảo profile có các giá trị dự phòng
        profile: {
          fullName: data.fullName || data.profile?.fullName || 'Chưa cập nhật',
          phoneNumber: data.profile?.phoneNumber || '---',
          dateOfBirth: data.profile?.dateOfBirth ? new Date(data.profile.dateOfBirth).toLocaleDateString('vi-VN') : '---',
          gender: data.profile?.gender || '---',
          address: data.profile?.address || '---',
          bio: data.profile?.bio || 'Chưa có tiểu sử.'
        }
      });
    } catch (e) {
      message.error('Không tải được thông tin chi tiết người dùng');
      setShowDetailModal(false);
    }
    finally { setIsLoadingDetail(true); setIsLoadingDetail(false); }
  };


  // --- CALCULATE STATS ---
  const counts = {
    total: users.length,
    admin: users.filter(u => u.role.match(/Admin|Quản trị/)).length,
    teacher: users.filter(u => u.role.match(/Teacher|Giáo viên/)).length,
    student: users.filter(u => u.role.match(/Student|Học sinh/)).length,
    active: users.filter(u => u.status === 'Hoạt động').length
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý người dùng</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý tài khoản, vai trò và phân quyền hệ thống</p>
          </div>
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
            <Button
              onClick={() => setShowImportModal(true)}
              className="h-10 px-5 rounded-lg border-slate-300 text-slate-600 hover:text-[#0463ca] hover:border-[#0463ca] font-semibold bg-white shadow-sm flex items-center gap-2 transition-all"
            >
              <Upload size={18} /> Nhập file
            </Button>
            <Button
              type="primary"
              onClick={() => { setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' }); setShowCreateModal(true); }}
              className="bg-[#0463ca] hover:bg-[#0352a8] h-10 px-6 rounded-lg font-bold shadow-md border-none flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={20} /> Thêm người dùng
            </Button>
          </div>
        </header>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-700">
          {/* Total Users */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng người dùng</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalUsers.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center text-emerald-500 text-[11px] font-black">
                <ArrowUpRight size={14} strokeWidth={3} /> +12%
              </div>
              <span className="text-slate-400 text-[11px] font-bold">tháng này</span>
            </div>
          </Card>

          {/* Admin Count */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Admin</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{counts.admin}</h3>
              </div>
              <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                <Shield size={20} />
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(counts.admin / Math.max(counts.total, 1)) * 100}%` }}></div>
            </div>
          </Card>

          {/* Teacher Count */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Giáo viên</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{counts.teacher}</h3>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                <GraduationCap size={20} />
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(counts.teacher / Math.max(counts.total, 1)) * 100}%` }}></div>
            </div>
          </Card>

          {/* Student Count */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Học sinh</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{counts.student}</h3>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(counts.student / Math.max(counts.total, 1)) * 100}%` }}></div>
            </div>
          </Card>
        </div>

        {/* TOOLBAR & SEARCH */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="flex-1 w-full relative group">
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc ID..."
              prefix={<Search size={18} className="text-slate-400 group-focus-within:text-[#0463ca] transition-colors" />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-11 rounded-lg border-slate-200 bg-white hover:border-[#0463ca] focus:hover:border-[#0463ca] transition-all font-medium text-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Select
              value={filterRole}
              onChange={setFilterRole}
              className="w-40 h-11 [&>.ant-select-selector]:!rounded-lg"
              options={[
                { value: 'Tất cả', label: 'Tất cả Vai trò' },
                { value: 'Học sinh', label: 'Học sinh' },
                { value: 'Giáo viên', label: 'Giáo viên' },
                { value: 'Quản lý', label: 'Quản lý' },
                { value: 'Quản trị viên', label: 'Admin' },
              ]}
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-40 h-11 [&>.ant-select-selector]:!rounded-lg"
              options={[
                { value: 'Tất cả', label: 'Tất cả Trạng thái' },
                { value: 'Hoạt động', label: 'Hoạt động' },
                { value: 'Tạm khóa', label: 'Đã khóa' },
              ]}
            />
            <Button
              className="h-11 px-4 rounded-lg bg-white border-slate-200 text-slate-500 hover:text-[#0463ca] hover:border-[#0463ca] shadow-sm flex items-center gap-2"
              icon={<Download size={18} />}
              onClick={handleExportExcel}
            >
              Xuất File
            </Button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Thành viên</th>
                  <th className="px-6 py-4">Email / ID</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <Spin size="large" />
                      <p className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <Empty description={<span className="font-bold text-slate-400">Không tìm thấy nhân sự phù hợp</span>} />
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ring-1 ring-slate-100 shadow-sm ${user.role.match(/Admin|Quản trị/) ? 'bg-purple-100 text-purple-600' :
                            user.role.match(/Manager|Quản lý/) ? 'bg-blue-100 text-blue-600' :
                              user.role.match(/Teacher|Giáo viên/) ? 'bg-emerald-100 text-emerald-600' :
                                'bg-slate-100 text-slate-500'
                            }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#0463ca] transition-colors">{user.name}</div>
                            <div className="text-[11px] text-slate-400 font-medium">Tham gia: {user.joinDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0487e2]">{user.email}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {user.id.toString().slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.role.match(/Admin|Quản trị/) ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100' :
                          user.role.match(/Manager|Quản lý/) ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' :
                            user.role.match(/Teacher|Giáo viên/) ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' :
                              'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'Hoạt động' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          <span className={`text-xs font-bold ${user.status === 'Hoạt động' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {user.status === 'Hoạt động' ? 'Hoạt động' : 'Tạm khóa'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all">
                          <Tooltip title="Chi tiết"><Button type="text" shape="circle" onClick={() => handleViewUser(user)} icon={<Eye size={16} className="text-slate-500 hover:text-[#0463ca]" />} /></Tooltip>
                          <Tooltip title="Sửa"><Button type="text" shape="circle" onClick={() => handleEditUser(user)} icon={<Edit size={16} className="text-slate-500 hover:text-[#0463ca]" />} /></Tooltip>
                          <Tooltip title="Khóa/Mở"><Button type="text" shape="circle" onClick={() => handleToggleStatus(user)} icon={user.status === 'Hoạt động' ? <PowerOff size={16} className="text-slate-500 hover:text-amber-600" /> : <Power size={16} className="text-slate-500 hover:text-emerald-600" />} /></Tooltip>
                          <Tooltip title="Xóa"><Button type="text" shape="circle" onClick={() => handleDeleteClick(user)} icon={<Trash2 size={16} className="text-slate-500 hover:text-rose-600" />} /></Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalUsers)} của {totalUsers} người dùng
            </div>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalUsers}
              onChange={(page, pSize) => {
                setCurrentPage(page);
                setPageSize(pSize);
              }}
              showSizeChanger
              size="small"
              className="custom-pagination"
            />
          </div>
        </div>
      </div>

      {/* --- MODALS SECTION --- */}

      {/* CREATE / EDIT MODAL - EXPANDED WITH MORE PROFILE FIELDS */}
      <Modal
        title={<div className="text-[#0463ca] uppercase text-xs font-black tracking-widest">{showEditModal ? 'Cập nhật hồ sơ người dùng' : 'Thêm thành viên mới'}</div>}
        open={showCreateModal || showEditModal}
        onCancel={() => { setShowCreateModal(false); setShowEditModal(false); }}
        footer={null}
        centered
        width={620}
      >
        <Form layout="vertical" onFinish={showEditModal ? handleSaveEdit : handleCreateUser} className="pt-4">
          <div className="max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar">
            <div className={`grid ${showEditModal ? 'grid-cols-2' : 'grid-cols-1'} gap-x-6 gap-y-0.5`}>

              <Form.Item label={<span className="font-bold text-slate-500 text-[10px] uppercase">Họ và tên</span>} required>
                <Input
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên đầy đủ"
                  className="h-10 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-slate-500 text-[10px] uppercase">Email</span>}
                required
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không đúng định dạng' }
                ]}
              >
                <Input
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  disabled={showEditModal}
                  placeholder="example@domain.com"
                  className="h-10 rounded-lg disabled:bg-slate-50 disabled:text-slate-400"
                />
              </Form.Item>

              {showEditModal && (
                <>
                  <Form.Item label={<span className="font-bold text-slate-500 text-[10px] uppercase">Số điện thoại</span>}>
                    <Input
                      value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="09xx xxx xxx"
                      className="h-10 rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item label={<span className="font-bold text-slate-500 text-[10px] uppercase">Ngày sinh</span>}>
                    <DatePicker
                      value={formData.dateOfBirth}
                      onChange={date => setFormData({ ...formData, dateOfBirth: date })}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sinh"
                      className="w-full h-10 rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item label={<span className="font-bold text-slate-500 text-[10px] uppercase">Giới tính</span>}>
                    <Radio.Group
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="pt-1"
                    >
                      <Radio value="Nam">Nam</Radio>
                      <Radio value="Nữ">Nữ</Radio>
                      <Radio value="Khác">Khác</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item label={<span className="font-bold text-slate-500 text-[10px] uppercase">Địa chỉ</span>}>
                    <Input
                      value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Thành phố, Quận/Huyện..."
                      className="h-10 rounded-lg"
                    />
                  </Form.Item>

                  <div className="col-span-2">
                    <Form.Item label={<span className="font-bold text-slate-500 text-[10px] uppercase">Hệ thống & Trạng thái</span>}>
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          value={formData.role} onChange={v => setFormData({ ...formData, role: v })}
                          className="h-10 w-full"
                          disabled // Thường không đổi role ở đây để tránh lỗi logic
                        >
                          {['Học sinh', 'Giáo viên', 'Quản lý', 'Quản trị viên'].map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
                        </Select>
                        <Select
                          value={formData.status} onChange={v => setFormData({ ...formData, status: v })}
                          className="h-10 w-full"
                        >
                          <Select.Option value="Hoạt động">Hoạt động</Select.Option>
                          <Select.Option value="Tạm khóa">Tạm khóa</Select.Option>
                        </Select>
                      </div>
                    </Form.Item>
                  </div>

                  <div className="col-span-2">
                    <Form.Item label={<span className="font-bold text-slate-500 text-[10px] uppercase">Tiểu sử</span>}>
                      <Input.TextArea
                        value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Giới thiệu ngắn về bản thân..."
                        rows={3}
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </div>
                </>
              )}

              {!showEditModal && (
                <div className="grid grid-cols-1 gap-4">
                  <Form.Item label={<span className="font-bold text-slate-500 text-[10px] uppercase">Vai trò</span>}>
                    <Select
                      value={formData.role} onChange={v => setFormData({ ...formData, role: v })}
                      className="h-10 w-full"
                    >
                      {['Học sinh', 'Giáo viên', 'Quản lý', 'Quản trị viên'].map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100 mt-6">
            <Button onClick={() => { setShowCreateModal(false); setShowEditModal(false) }} className="flex-1 h-11 rounded-xl font-bold border-none bg-slate-100 text-slate-500 hover:bg-slate-200 uppercase text-xs tracking-widest">Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isLoading} className="flex-1 h-11 rounded-xl bg-[#0463ca] font-bold border-none shadow-lg shadow-blue-100 uppercase text-xs tracking-widest">Lưu thay đổi</Button>
          </div>
        </Form>
      </Modal>

      {/* DETAIL MODAL - PREMIUM REDESIGN */}
      <Modal
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        centered
        width={550}
        closeIcon={<X size={18} className="text-slate-400 hover:text-rose-500 transition-colors" />}
        className="profile-modal"
      >
        {isLoadingDetail ? (
          <div className="py-20 text-center">
            <Spin size="large" />
            <p className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Đang tải hồ sơ...</p>
          </div>
        ) : (
          <div className="p-2">
            {/* Header Header */}
            <div className="flex items-center gap-5 mb-8 border-b border-slate-100 pb-6 mt-2">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-sm ${viewingUser?.roleName?.match(/Admin|Quản trị/) ? 'bg-purple-100 text-purple-600' :
                viewingUser?.roleName?.match(/Quản lý/) ? 'bg-blue-100 text-blue-600' :
                  viewingUser?.roleName?.match(/Giáo viên/) ? 'bg-emerald-100 text-emerald-600' :
                    'bg-slate-100 text-slate-500'
                }`}>
                {viewingUser?.profile?.fullName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 leading-none">{viewingUser?.profile?.fullName}</h3>
                  <Tag className={`m-0 border-none rounded-md px-2 py-0 text-[10px] font-black uppercase tracking-wider ${viewingUser?.roleName?.match(/Admin|Quản trị/) ? 'bg-purple-50 text-purple-600' :
                    viewingUser?.roleName?.match(/Quản lý/) ? 'bg-blue-50 text-blue-600' :
                      viewingUser?.roleName?.match(/Giáo viên/) ? 'bg-emerald-50 text-emerald-600' :
                        'bg-slate-100 text-slate-500'
                    }`}>
                    {viewingUser?.roleName}
                  </Tag>
                </div>
                <p className="text-slate-500 font-medium mb-2">{viewingUser?.email}</p>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Hash size={12} /> ID: {viewingUser?.id?.slice(0, 13)}...
                </div>
              </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Phone size={12} /> Số điện thoại
                </p>
                <p className="text-sm font-bold text-slate-700">{viewingUser?.profile?.phoneNumber}</p>
              </div>

              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Calendar size={12} /> Ngày sinh
                </p>
                <p className="text-sm font-bold text-slate-700">{viewingUser?.profile?.dateOfBirth}</p>
              </div>

              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <UserCircle size={12} /> Giới tính
                </p>
                <p className="text-sm font-bold text-slate-700">{viewingUser?.profile?.gender}</p>
              </div>

              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Activity size={12} /> Trạng thái
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className={`w-2 h-2 rounded-full ${viewingUser?.status === 'Hoạt động' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                  <span className={`text-xs font-bold ${viewingUser?.status === 'Hoạt động' ? 'text-emerald-00' : 'text-slate-400'}`}>
                    {viewingUser?.status}
                  </span>
                </div>
              </div>

              <div className="col-span-2 space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <MapPin size={12} /> Địa chỉ liên lạc
                </p>
                <p className="text-sm font-bold text-slate-700">{viewingUser?.profile?.address}</p>
              </div>

              <div className="col-span-2 space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <AlignLeft size={12} /> Tiểu sử / Mô tả
                </p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  {viewingUser?.profile?.bio}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Thành viên từ: {viewingUser?.joinDate}
              </div>
              <Button
                onClick={() => setShowDetailModal(false)}
                className="h-10 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-800 border-none bg-slate-100 hover:bg-slate-200 transition-all font-sans"
              >
                Đóng hồ sơ
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* IMPORT MODAL - ADVANCED PREVIEW & VALIDATION */}
      <Modal
        title={<div className="text-[#0463ca] uppercase text-[11px] font-black tracking-[0.2em]">Hệ thống nhập dữ liệu nhân sự</div>}
        open={showImportModal}
        onCancel={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setImportErrors([]); }}
        footer={null}
        centered
        width={importPreview.length > 0 ? 900 : 500}
        className="import-modal"
      >
        <div className="py-4">
          {!importFile ? (
            <div
              className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl hover:border-[#0463ca] hover:bg-blue-50/50 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx" onChange={handleFileSelect} />
              <div className="w-16 h-16 bg-blue-50 text-[#0463ca] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Tải lên danh sách người dùng</h4>
              <p className="text-slate-500 text-sm max-w-[280px] mx-auto">Chọn file Excel hoặc CSV đúng định dạng cột (Name, Email, Role)</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info & Summary */}
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                    <FileSearch className="text-[#0463ca]" size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{importFile.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kích thước: {(importFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng số dòng</p>
                    <p className="text-xl font-black text-slate-800 leading-none">{importPreview.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Hợp lệ</p>
                    <p className="text-xl font-black text-emerald-600 leading-none">{importPreview.length - importErrors.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Lỗi cột</p>
                    <p className="text-xl font-black text-rose-600 leading-none">{importErrors.length}</p>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Dòng</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Họ và tên</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Email hệ thống</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Vai trò</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Trạng thái</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Kiểm tra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {importPreview.map((row, i) => (
                        <tr key={i} className={row.errors.length > 0 ? "bg-rose-50/30" : "hover:bg-slate-50/50"}>
                          <td className="px-4 py-3 text-xs font-bold text-slate-400">{i + 1}</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-700">{row.name}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-600">{row.email}</td>
                          <td className="px-4 py-3">
                            <Tag className="rounded-md border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">{row.role}</Tag>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 pt-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Hoạt động' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                              <span className={`text-[10px] font-black uppercase ${row.status === 'Hoạt động' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {row.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {row.errors.length > 0 ? (
                              <Tooltip title={row.errors.join(", ")}>
                                <div className="flex items-center gap-1.5 text-rose-500 font-bold text-[10px] uppercase">
                                  <AlertTriangle size={12} /> {row.errors[0]}
                                </div>
                              </Tooltip>
                            ) : (
                              <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
                                <CheckCircle size={12} /> Sẵn sàng
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <Button
                  onClick={() => { setImportFile(null); setImportPreview([]); setImportErrors([]); }}
                  className="h-11 px-6 rounded-xl font-bold text-slate-500 bg-slate-100 border-none hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest"
                >
                  Chọn lại file
                </Button>
                <div className="flex-1"></div>
                <Button
                  onClick={() => setShowImportModal(false)}
                  className="h-11 px-6 rounded-xl font-bold text-slate-400 border-none hover:text-slate-600 uppercase text-[10px] tracking-widest"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="primary"
                  onClick={handleImportConfirm}
                  loading={isImporting}
                  disabled={(importPreview.length - importErrors.length) === 0 || importPreview.length === 0}
                  className="h-11 px-10 rounded-xl bg-[#0463ca] font-black border-none shadow-lg shadow-blue-100 uppercase text-[10px] tracking-[0.1em] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  Xác nhận nhập {importPreview.length - importErrors.length} dòng hợp lệ
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={showDeleteModal} onCancel={() => setShowDeleteModal(false)} footer={null} centered width={360} className="rounded-2xl">
        <div className="text-center pt-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Xóa tài khoản này?</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">Hành động này không thể hoàn tác. Nhập email <b>{deletingUser?.email}</b> để xác nhận.</p>
          <Input
            value={deleteConfirmationInput}
            onChange={e => setDeleteConfirmationInput(e.target.value)}
            placeholder={deletingUser?.email}
            className="text-center h-10 rounded-lg border-slate-200 bg-slate-50 mb-4 font-semibold"
          />
          <div className="flex gap-3">
            <Button block className="h-10 rounded-lg font-semibold" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
            <Button block danger type="primary" disabled={deleteConfirmationInput !== deletingUser?.email} onClick={handleConfirmDelete} loading={isLoading} className="h-10 rounded-lg font-bold">Xóa vĩnh viễn</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}