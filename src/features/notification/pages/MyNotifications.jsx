import React, { useState, useEffect, useCallback } from 'react';
import {
    Bell,
    CheckCheck,
    Clock,
    ExternalLink,
    Search,
    Filter,
    CheckCircle2,
    Inbox,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye as ViewIcon
} from 'lucide-react';
import {
    Badge,
    Spin,
    List,
    Button,
    message,
    Tooltip,
    Empty,
    Card,
    Input,
    Select,
    Segmented,
    Divider,
    Pagination,
    Modal
} from 'antd';
import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../api/notificationApi';
import { Link } from 'react-router-dom';

const { Option } = Select;

export default function MyNotifications() {
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [markingAll, setMarkingAll] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 1
    });

    // Filter
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

    const fetchNotifications = useCallback(async (page = 1, pageSize = 10, isRead = null) => {
        setLoading(true);
        try {
            const params = {
                page,
                pageSize,
                ...(isRead !== null ? { isRead } : {})
            };

            const resp = await getMyNotifications(params);
            if (resp.success) {
                setNotifications(resp.data?.items || []);
                setPagination({
                    page: resp.data?.page || page,
                    pageSize: resp.data?.pageSize || pageSize,
                    totalCount: resp.data?.totalCount || 0,
                    totalPages: resp.data?.totalPages || 1
                });
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
            message.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const isReadParam = filter === 'unread' ? false : (filter === 'read' ? true : null);
        fetchNotifications(1, pagination.pageSize, isReadParam);
    }, [filter, fetchNotifications, pagination.pageSize]);

    const handleMarkAsRead = async (id) => {
        try {
            const resp = await markNotificationAsRead(id);
            if (resp.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
            }
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            const resp = await markAllNotificationsAsRead();
            if (resp.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                message.success('Đã đánh dấu tất cả là đã đọc');
            }
        } catch (err) {
            message.error('Thao tác thất bại');
        } finally {
            setMarkingAll(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-200">
                                <Bell size={26} />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">Thông báo của tôi</h1>
                        </div>
                        <p className="text-slate-500 font-medium ml-1">
                            Theo dõi và quản lý tất cả các cập nhật từ hệ thống Edu-AI.
                        </p>
                    </div>

                    <Button
                        type="primary"
                        icon={<CheckCheck size={18} />}
                        onClick={handleMarkAllRead}
                        loading={markingAll}
                        className="rounded-xl h-12 px-6 font-bold bg-slate-800 border-none shadow-lg shadow-slate-200 hover:scale-105 transition-transform"
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                </div>

                {/* Toolbar & Filters */}
                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <Segmented
                            options={[
                                { label: 'Tất cả thông báo', value: 'all', icon: <Inbox size={14} className="inline mr-1" /> },
                                { label: 'Chưa đọc', value: 'unread', icon: <Badge dot size="small"><div className="w-1" /></Badge> },
                                { label: 'Đã đọc', value: 'read', icon: <CheckCircle2 size={14} className="inline mr-1 text-emerald-500" /> }
                            ]}
                            value={filter}
                            onChange={setFilter}
                            className="p-1.5 bg-slate-100 rounded-2xl font-bold text-slate-600"
                            size="large"
                        />

                        <div className="text-sm font-bold text-slate-400">
                            Tổng số thông báo: <span className="text-slate-800">{pagination.totalCount}</span>
                        </div>
                    </div>
                </Card>

                {/* Notification List */}
                <div className="space-y-4">
                    <Spin spinning={loading} tip="Đang tải thông báo...">
                        {notifications.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {notifications.map((n) => (
                                    <Card
                                        key={n.id}
                                        onClick={() => {
                                            setSelectedNotification(n);
                                            setIsModalOpen(true);
                                            if (!n.isRead) handleMarkAsRead(n.id);
                                        }}
                                        className={`rounded-3xl border-none shadow-sm transition-all hover:shadow-md cursor-pointer group ${!n.isRead ? 'bg-white border-l-4 border-l-blue-600' : 'bg-white/60'}`}
                                        bodyStyle={{ padding: '24px' }}
                                    >
                                        <div className="flex gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                                <Bell size={24} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className={`text-lg leading-tight truncate pr-8 ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                                                        {n.title}
                                                    </h3>
                                                    {!n.isRead && (
                                                        <Badge status="processing" color="#2563eb" />
                                                    )}
                                                </div>

                                                <p className={`text-sm leading-relaxed mb-4 ${!n.isRead ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                                    {n.message}
                                                </p>

                                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-50 pt-4">
                                                    <div className="flex items-center gap-6">
                                                        <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                            <Calendar size={14} />
                                                            {formatDate(n.createdAt)}
                                                        </span>
                                                        {!n.isRead && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Mới</span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {n.link && (
                                                            <Link
                                                                to={n.link}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-blue-100 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                                                            >
                                                                Khám phá ngay <ExternalLink size={12} />
                                                            </Link>
                                                        )}
                                                        <Tooltip title="Xem chi tiết">
                                                            <Button
                                                                type="text"
                                                                icon={<ViewIcon size={18} />}
                                                                className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-blue-100"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedNotification(n);
                                                                    setIsModalOpen(true);
                                                                    if (!n.isRead) handleMarkAsRead(n.id);
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : !loading && (
                            <Card className="rounded-3xl border-none shadow-sm py-20 flex justify-center">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<span className="text-slate-400 font-bold">Bạn không có thông báo nào trong danh mục này</span>}
                                />
                            </Card>
                        )}
                    </Spin>
                </div>

                {/* Pagination */}
                {!loading && pagination.totalCount > 0 && (
                    <div className="flex justify-center pt-8 pb-12">
                        <Pagination
                            current={pagination.page}
                            total={pagination.totalCount}
                            pageSize={pagination.pageSize}
                            onChange={(page) => fetchNotifications(page, pagination.pageSize, filter === 'all' ? null : (filter === 'unread' ? false : true))}
                            className="custom-pagination"
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>

            {/* Notification Detail Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Bell size={20} />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-800 leading-tight">Chi tiết thông báo</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Edu-AI Notification System</p>
                        </div>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button 
                        key="close" 
                        onClick={() => setIsModalOpen(false)}
                        className="rounded-xl font-bold h-11 px-6 border-slate-200"
                    >
                        Đóng
                    </Button>,
                    selectedNotification?.link && (
                        <Button
                            key="action"
                            type="primary"
                            icon={<ExternalLink size={16} />}
                            onClick={() => window.open(selectedNotification.link, '_blank')}
                            className="rounded-xl font-black h-11 px-6 bg-blue-600 border-none shadow-lg shadow-blue-100"
                        >
                            KHÁM PHÁ NGAY
                        </Button>
                    )
                ]}
                centered
                width={600}
                className="notification-detail-modal"
            >
                {selectedNotification && (
                    <div className="py-6 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 leading-snug">
                                {selectedNotification.title}
                            </h2>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <Clock size={14} />
                                {formatDate(selectedNotification.createdAt)}
                            </div>
                        </div>

                        <Divider className="m-0 bg-slate-100" />

                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Nội dung chi tiết</p>
                            <div className="text-base text-slate-700 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
                                {selectedNotification.message}
                            </div>
                        </div>

                        {selectedNotification.link && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Đường dẫn đính kèm</p>
                                <div className="flex items-center gap-2 p-3 bg-blue-50/30 rounded-xl border border-blue-50 text-blue-600 text-xs font-bold break-all">
                                    <ExternalLink size={14} className="shrink-0" />
                                    {selectedNotification.link}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <style>{`
        .custom-pagination .ant-pagination-item {
          border: none;
          background: white;
          border-radius: 12px;
          font-weight: bold;
        }
        .custom-pagination .ant-pagination-item-active {
          background: #2563eb;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white !important;
        }
        .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
        .custom-pagination .ant-pagination-next .ant-pagination-item-link {
          border: none;
          background: white;
          border-radius: 12px;
        }
      `}</style>
        </div>
    );
}
