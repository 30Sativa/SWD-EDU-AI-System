import React, { useState, useRef, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Filter, Download, Upload, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Save, Power, PowerOff, MoreVertical } from 'lucide-react';
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

  const handleCreateUser = () => {
    if (!formData.name || !formData.email) return alert('Vui lòng điền đủ thông tin');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return alert('Email không hợp lệ');
    if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) return alert('Email đã tồn tại');
    const newUser = { id: users.length + 1, name: formData.name, email: formData.email.toLowerCase(), role: formData.role, status: formData.status, joinDate: new Date().toLocaleDateString('vi-VN') };
    setUsers([...users, newUser]);
    setShowCreateModal(false);
    setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
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

  const handleDeleteUser = (user) => {
    if (window.confirm(`Xóa người dùng "${user.name}"?`)) {
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Người dùng</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý tài khoản, phân quyền và trạng thái hệ thống.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-5 py-2.5 bg-white text-[#0487e2] font-semibold rounded-lg border border-[#0487e2] hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Upload size={18} />
              <span>Nhập File</span>
            </button>
            <button
              onClick={() => {
                setFormData({ name: '', email: '', role: 'Học sinh', status: 'Hoạt động' });
                setShowCreateModal(true);
              }}
              className="px-5 py-2.5 bg-[#0487e2] text-white font-semibold rounded-lg hover:bg-[#0463ca] transition-all shadow-md shadow-[#0487e2]/20 flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Thêm Người dùng</span>
            </button>
          </div>
        </header>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="flex gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20"
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
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20"
              >
                <option>Tất cả Trạng thái</option>
                <option>Hoạt động</option>
                <option>Tạm khóa</option>
              </select>
              <div className="relative group">
                <button className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all flex items-center gap-2">
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
                    <th className="px-6 py-4">
                      <button onClick={() => handleSort('joinDate')} className="flex items-center gap-1 hover:text-[#0487e2]">
                        Tham gia {getSortIcon('joinDate')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
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
                                'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
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
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{user.joinDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleToggleStatus(user)} className="p-2 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-orange-50" title="Đổi trạng thái">
                            {user.status === 'Hoạt động' ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                          <button onClick={() => handleEditUser(user)} className="p-2 text-slate-400 hover:text-[#0487e2] rounded-lg hover:bg-[#f0f6fa]" title="Sửa">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(user)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50" title="Xóa">
                            <Trash2 size={16} />
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

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#0463ca]">{showEditModal ? 'Cập nhật Thông tin' : 'Thêm Người dùng Mới'}</h2>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Họ và tên</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0487e2]/20 outline-none font-medium text-sm transition-all" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Email định danh</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0487e2]/20 outline-none font-medium text-sm transition-all" placeholder="user@domain.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Vai trò</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all">
                    <option value="Học sinh">Học sinh</option>
                    <option value="Giáo viên">Giáo viên</option>
                    <option value="Quản lý">Quản lý</option>
                    <option value="Quản trị viên">Quản trị viên</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Trạng thái</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all">
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-5 py-2 text-sm font-bold text-slate-500">Hủy</button>
              <button onClick={showEditModal ? handleUpdateUser : handleCreateUser} className="px-6 py-2 bg-[#0487e2] text-white font-bold rounded-xl text-sm hover:bg-[#0463ca] shadow-md shadow-[#0487e2]/20 transition-all flex items-center gap-2">
                <Save size={16} />
                <span>{showEditModal ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}