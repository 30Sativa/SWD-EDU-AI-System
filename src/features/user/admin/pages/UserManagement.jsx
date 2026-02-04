import React, { useState, useRef, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Filter, Download, Upload, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Save, Power, PowerOff, MoreVertical, Mail, Shield, Activity, Eye, ChevronDown, User } from 'lucide-react';
import * as XLSX from 'xlsx';
import { message, Spin, Button, Input, Modal, Form, Select, Tooltip, Empty, Tag } from 'antd';
// Đảm bảo đường dẫn import API này đúng với cấu trúc dự án của bạn
import { getUsers, getRoleName, ROLE_ENUM, getUserById, deleteUser, createUser, updateUserProfile } from "../../api/userApi";

export default function UserManagement() {
  // --- STATES ---
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
          Page: 1,
          PageSize: 100
        };

        const response = await getUsers(params);
        let rawItems = [];
        // Xử lý các dạng response khác nhau
        if (Array.isArray(response)) rawItems = response;
        else if (response?.items) rawItems = response.items;
        else if (response?.data?.items) rawItems = response.data.items;
        else if (response?.data) rawItems = response.data;

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

    const timer = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterRole, filterStatus]);

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
    try {
      let rawData = [];
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        rawData = parseCSV(text);
      } else {
        rawData = await parseExcel(file);
      }
      // Simplified mapping for demo
      const normalizedData = rawData.map((row, index) => ({
        name: row.name || row['Họ và tên'],
        email: row.email || row['Email'],
        role: row.role || 'Học sinh',
        status: 'Hoạt động'
      }));
      setImportPreview(normalizedData);
    } catch (error) { console.error(error); }
    finally { setIsImporting(false); }
  };

  const handleImportConfirm = () => {
    if (importPreview.length > 0) {
      setUsers([...users, ...importPreview.map((u, i) => ({ ...u, id: users.length + i + 1, joinDate: new Date().toLocaleDateString() }))]);
      message.success(`Đã nhập ${importPreview.length} người dùng`);
      setShowImportModal(false);
      setImportFile(null);
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
    setIsLoading(true);
    try {
      const ROLE_ID_MAP = { 'Quản trị viên': ROLE_ENUM.ADMIN, 'Quản lý': ROLE_ENUM.MANAGER, 'Giáo viên': ROLE_ENUM.TEACHER, 'Học sinh': ROLE_ENUM.STUDENT };
      const payload = {
        FullName: formData.name,
        UserName: formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''),
        Email: formData.email,
        Password: '123456',
        Role: ROLE_ID_MAP[formData.role] || ROLE_ENUM.STUDENT
      };
      await createUser(payload);
      message.success('Tạo thành công');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
      window.location.reload();
    } catch (error) { message.error('Tạo thất bại: ' + error.message); }
    finally { setIsLoading(false); }
  };

  const handleSaveEdit = async () => {
    if (!formData.name) return message.warning("Nhập tên");
    setIsLoading(true);
    try {
      await updateUserProfile(editingUser.id, { FullName: formData.name });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, name: formData.name } : u));
      message.success("Cập nhật thành công");
      setShowEditModal(false);
    } catch (error) { message.error("Lỗi cập nhật"); }
    finally { setIsLoading(false); }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    setShowEditModal(true);
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
      const data = res.data?.data || res.data || res;
      setViewingUser({
        ...data,
        profile: data.profile || {},
        displayName: data.profile?.fullName || data.userName,
        roleName: getRoleName(data.role),
        status: data.isActive ? 'Hoạt động' : 'Tạm khóa',
        joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-'
      });
    } catch (e) { message.error('Không tải được chi tiết'); setShowDetailModal(false); }
    finally { setIsLoadingDetail(false); }
  };


  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản trị viên</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý nhân sự và phân quyền hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowImportModal(true)}
              className="h-11 px-5 rounded-lg border-slate-200 text-slate-600 hover:text-[#0487e2] hover:border-[#0487e2] font-semibold bg-white shadow-sm flex items-center gap-2"
            >
              <Upload size={18} /> Nhập liệu
            </Button>
            <Button
              type="primary"
              onClick={() => { setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' }); setShowCreateModal(true); }}
              className="bg-[#0487e2] hover:bg-[#0463ca] h-11 px-6 rounded-lg font-semibold shadow-md border-none flex items-center gap-2"
            >
              <Plus size={18} /> Thêm mới
            </Button>
          </div>
        </header>

        {/* TOOLBAR & FILTER */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<Search size={18} className="text-slate-400" />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border-slate-200"
            />
            <Select
              value={filterRole}
              onChange={setFilterRole}
              className="w-40 h-10"
              options={[
                { value: 'Tất cả', label: 'Mọi vai trò' },
                { value: 'Học sinh', label: 'Học sinh' },
                { value: 'Giáo viên', label: 'Giáo viên' },
                { value: 'Quản lý', label: 'Quản lý' },
                { value: 'Quản trị viên', label: 'Quản trị viên' },
              ]}
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-40 h-10"
              options={[
                { value: 'Tất cả', label: 'Mọi trạng thái' },
                { value: 'Hoạt động', label: 'Hoạt động' },
                { value: 'Tạm khóa', label: 'Tạm khóa' },
              ]}
            />
          </div>

          <div className="relative group">
            <Button className="h-10 px-5 rounded-lg bg-slate-50 text-[#0487e2] font-bold border-none hover:bg-indigo-50 flex items-center gap-2">
              <Download size={18} /> Xuất file
            </Button>
            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
              <button onClick={handleExportExcel} className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0487e2] rounded-lg flex items-center gap-2 transition-colors">
                <FileSpreadsheet size={16} /> Xuất Excel
              </button>
            </div>
          </div>
        </div>

        {/* TABLE DISPLAY - CLEAN UI VERSION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Spin size="large" />
              <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse custom-table">
                <thead className="bg-[#fafafa] border-b border-slate-200">
                  <tr className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                    <th className="px-6 py-4 cursor-pointer hover:text-[#0487e2] transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">Thành viên {getSortIcon('name')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-[#0487e2] transition-colors" onClick={() => handleSort('email')}>
                      <div className="flex items-center gap-2">Liên hệ {getSortIcon('email')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-[#0487e2] transition-colors" onClick={() => handleSort('role')}>
                      <div className="flex items-center gap-2">Vai trò {getSortIcon('role')}</div>
                    </th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Empty description="Không tìm thấy dữ liệu" />
                      </td>
                    </tr>
                  ) : filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-all duration-200 group">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm transition-transform group-hover:scale-105 ${user.role.match(/Admin|Quản trị/) ? 'bg-violet-500' :
                            user.role.match(/Manager|Quản lý/) ? 'bg-[#0487e2]' :
                              user.role.match(/Teacher|Giáo viên/) ? 'bg-teal-500' :
                                'bg-slate-400'
                            }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 group-hover:text-[#0487e2] transition-colors">{user.name}</div>
                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">ID: {user.id.toString().slice(0, 6)}</div>
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                          {user.email}
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-6 py-4">
                        <Tag color={
                          user.role.match(/Admin|Quản trị/) ? 'purple' :
                            user.role.match(/Manager|Quản lý/) ? 'blue' :
                              user.role.match(/Teacher|Giáo viên/) ? 'cyan' :
                                'default'
                        } className="font-semibold border-0">
                          {user.role}
                        </Tag>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <Tag color={user.status === 'Hoạt động' ? 'success' : 'default'} className="border-0">
                          {user.status}
                        </Tag>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-all duration-200">
                          <Tooltip title="Chi tiết"><Button type="text" shape="circle" onClick={() => handleViewUser(user)} icon={<Eye size={16} className="text-slate-500 hover:text-[#0487e2]" />} /></Tooltip>
                          <Tooltip title="Sửa"><Button type="text" shape="circle" onClick={() => handleEditUser(user)} icon={<Edit size={16} className="text-slate-500 hover:text-[#0487e2]" />} /></Tooltip>
                          <Tooltip title="Khóa/Mở"><Button type="text" shape="circle" onClick={() => handleToggleStatus(user)} icon={user.status === 'Hoạt động' ? <PowerOff size={16} className="text-slate-500 hover:text-amber-600" /> : <Power size={16} className="text-slate-500 hover:text-emerald-600" />} /></Tooltip>
                          <Tooltip title="Xóa"><Button type="text" shape="circle" onClick={() => handleDeleteClick(user)} icon={<Trash2 size={16} className="text-slate-500 hover:text-rose-600" />} /></Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS SECTION --- */}

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={<div className="text-[#0463ca] uppercase text-xs font-black tracking-widest">{showEditModal ? 'Cập nhật thông tin' : 'Thêm thành viên mới'}</div>}
        open={showCreateModal || showEditModal}
        onCancel={() => { setShowCreateModal(false); setShowEditModal(false); }}
        footer={null}
        centered
        width={500}
      >
        <Form layout="vertical" onFinish={showEditModal ? handleSaveEdit : handleCreateUser} initialValues={formData} className="pt-6 space-y-4">
          <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Họ và tên</span>}>
            <Input
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên đầy đủ"
              className="h-11 rounded-lg"
            />
          </Form.Item>
          <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Email</span>}>
            <Input
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              disabled={showEditModal}
              placeholder="example@domain.com"
              className="h-11 rounded-lg disabled:bg-slate-50"
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Vai trò</span>}>
              <Select
                value={formData.role} onChange={v => setFormData({ ...formData, role: v })}
                className="h-11 w-full"
              >
                {['Học sinh', 'Giáo viên', 'Quản lý', 'Quản trị viên'].map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Trạng thái</span>}>
              <Select
                value={formData.status} onChange={v => setFormData({ ...formData, status: v })}
                className="h-11 w-full"
              >
                <Select.Option value="Hoạt động">Hoạt động</Select.Option>
                <Select.Option value="Tạm khóa">Tạm khóa</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => { setShowCreateModal(false); setShowEditModal(false) }} className="flex-1 h-11 rounded-lg font-semibold border-slate-200 text-slate-500">Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isLoading} className="flex-1 h-11 rounded-lg bg-[#0487e2] font-semibold border-none">Lưu lại</Button>
          </div>
        </Form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        centered
        width={400}
        closeIcon={<X className="text-white hover:rotate-90 transition-transform" />}
        className="overflow-hidden"
      >
        <div className="-m-6 bg-white rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-[#0487e2] to-[#0463ca] relative flex items-end justify-center pb-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"><Users size={100} className="text-white" /></div>
            <div className="translate-y-1/2 w-24 h-24 bg-white p-1 rounded-full shadow-xl">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-black text-[#0463ca]">
                {isLoadingDetail ? <Spin /> : viewingUser?.displayName?.charAt(0)}
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-6 text-center space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{viewingUser?.displayName}</h3>
              <p className="text-slate-500 font-medium">{viewingUser?.email}</p>
              <div className="flex justify-center gap-2 mt-3">
                <Tag color="blue" className="uppercase font-bold">{viewingUser?.roleName}</Tag>
                <Tag color={viewingUser?.status === 'Hoạt động' ? 'success' : 'error'} className="uppercase font-bold">{viewingUser?.status}</Tag>
              </div>
            </div>
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0487e2] shadow-sm"><Phone size={16} /></div>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Điện thoại</p><p className="text-sm font-semibold text-slate-700">{viewingUser?.profile?.phoneNumber || '---'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0487e2] shadow-sm"><MapPin size={16} /></div>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Địa chỉ</p><p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{viewingUser?.profile?.address || '---'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0487e2] shadow-sm"><Activity size={16} /></div>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Ngày tham gia</p><p className="text-sm font-semibold text-slate-700">{viewingUser?.joinDate}</p></div>
              </div>
            </div>
            <Button block className="h-11 rounded-lg font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 border-slate-200" onClick={() => setShowDetailModal(false)}>Đóng</Button>
          </div>
        </div>
      </Modal>

      {/* IMPORT MODAL */}
      <Modal title={<div className="text-[#0463ca] uppercase text-xs font-black tracking-widest ">Nhập dữ liệu</div>} open={showImportModal} onCancel={() => setShowImportModal(false)} footer={null} centered className="rounded-2xl">
        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl hover:border-[#0487e2] hover:bg-blue-50/30 transition-all cursor-pointer group" onClick={() => fileInputRef.current.click()}>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx" onChange={handleFileSelect} />
          {importFile ? <div className="text-[#0487e2] font-bold">{importFile.name}</div> : (
            <>
              <Upload className="mx-auto text-slate-300 group-hover:text-[#0487e2] mb-3" size={40} />
              <p className="text-slate-500 font-medium">Click để tải lên file CSV/Excel</p>
            </>
          )}
        </div>
        {importFile && (
          <Button type="primary" block className="mt-4 h-11 rounded-lg bg-[#0487e2] font-bold" onClick={handleImportConfirm} loading={isImporting}>Xác nhận nhập</Button>
        )}
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