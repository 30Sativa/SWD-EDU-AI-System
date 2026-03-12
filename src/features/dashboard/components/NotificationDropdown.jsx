import React, { useState, useEffect, useCallback } from 'react';
import {
    Bell,
    CheckCheck,
    Clock,
    ExternalLink,
    MoreHorizontal,
    Circle,
    Eye as ViewIcon
} from 'lucide-react';
import { Badge, Spin, List, Button, message, Tooltip, Empty, Modal, Divider } from 'antd';
import {
    getMyNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../../notification/api/notificationApi';
import { Link, useNavigate } from 'react-router-dom';

export default function NotificationDropdown({ basePath }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    
    // Modal state
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const resp = await getUnreadNotificationsCount();
            if (resp.success) {
                setUnreadCount(resp.data || 0);
            }
        } catch (err) {
            console.error('Failed to fetch unread count', err);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await getMyNotifications();
            if (resp.success) {
                setNotifications(resp.data?.items || []);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleMarkAsRead = async (id, e) => {
        e?.preventDefault();
        e?.stopPropagation();
        try {
            const resp = await markNotificationAsRead(id);
            if (resp.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                fetchUnreadCount();
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
                setUnreadCount(0);
                message.success('Đã đánh dấu tất cả là đã đọc');
            }
        } catch (err) {
            message.error('Thao tác thất bại');
        } finally {
            setMarkingAll(false);
        }
    };

    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " năm trước";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " tháng trước";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " ngày trước";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " giờ trước";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " phút trước";
        return "Vừa xong";
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative transition-all active:scale-95"
                title="Thông báo"
            >
                <Badge count={unreadCount} size="small" offset={[2, 2]} overflowCount={99}>
                    <Bell size={20} className={unreadCount > 0 ? "text-blue-600" : ""} />
                </Badge>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[500px] animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <span className="font-bold text-slate-800">Thông báo gần đây</span>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<CheckCheck size={14} />}
                                        className="text-[11px] font-bold p-0 h-auto flex items-center gap-1"
                                        onClick={handleMarkAllRead}
                                        loading={markingAll}
                                    >
                                        Đọc tất cả
                                    </Button>
                                )}
                                <Tooltip title="Cài đặt">
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar min-h-[100px]">
                            {loading && notifications.length === 0 ? (
                                <div className="py-12 flex justify-center">
                                    <Spin tip="Đang tải..." />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-12">
                                    <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={(e) => {
                                                setSelectedNotification(n);
                                                setIsModalOpen(true);
                                                if (!n.isRead) handleMarkAsRead(n.id);
                                            }}
                                            className={`px-5 py-4 cursor-pointer transition-colors group relative flex gap-3 ${!n.isRead ? 'bg-blue-50/40 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="shrink-0 mt-1">
                                                {!n.isRead ? (
                                                    <Circle size={10} fill="currentColor" className="text-blue-600 animate-pulse" />
                                                ) : (
                                                    <div className="w-2.5 h-2.5" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className={`text-sm leading-tight mb-1 truncate ${!n.isRead ? 'font-bold text-slate-800' : 'text-slate-600 font-medium'}`}>
                                                        {n.title}
                                                    </h4>
                                                </div>
                                                <p className={`text-xs mb-2 leading-relaxed line-clamp-2 ${!n.isRead ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                        <Clock size={10} /> {timeSince(n.createdAt)}
                                                    </span>

                                                    <button
                                                        className="text-[10px] text-blue-600 font-black uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Xem ngay <ExternalLink size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center sticky bottom-0 z-10">
                            <Link
                                to={`${basePath}/my-notifications`}
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                Xem tất cả thông báo
                            </Link>
                        </div>
                    </div>
                </>
            )}

            {/* Notification Detail Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Bell size={20} />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-800 leading-tight">Chi tiết thông báo</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Edu-AI System Hub</p>
                        </div>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button 
                        key="close" 
                        onClick={() => setIsModalOpen(false)}
                        className="rounded-xl font-bold h-11 px-6"
                    >
                        Đóng
                    </Button>,
                    selectedNotification?.link && (
                        <Button
                            key="action"
                            type="primary"
                            icon={<ExternalLink size={16} />}
                            onClick={() => {
                                setIsModalOpen(false);
                                setIsOpen(false);
                                navigate(selectedNotification.link);
                            }}
                            className="rounded-xl font-black h-11 px-6 bg-blue-600 border-none shadow-lg shadow-blue-100"
                        >
                            KHÁM PHÁ NGAY
                        </Button>
                    )
                ]}
                centered
                width={550}
                className="notification-detail-modal"
            >
                {selectedNotification && (
                    <div className="py-4 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-lg font-black text-slate-900 leading-snug">
                                {selectedNotification.title}
                            </h2>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <Clock size={14} />
                                {new Date(selectedNotification.createdAt).toLocaleString('vi-VN')}
                            </div>
                        </div>

                        <Divider className="m-0" />

                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung</p>
                            <div className="text-[15px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                {selectedNotification.message}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
