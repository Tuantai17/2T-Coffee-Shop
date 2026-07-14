import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import SupportConversationList from './SupportConversationList';
import AdminChatWindow from './AdminChatWindow';
import { getAdminConversations, markAsReadAdmin, getAdminStatistics } from '../../../services/adminSupportApi';
import adminSupportSocket from '../../../services/adminSupportSocket';
import toast from 'react-hot-toast';

function AdminSupportPage() {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [stats, setStats] = useState({ unreadConversations: 0, totalCustomers: 0, todayMessages: 0 });

    const activeConversationIdRef = useRef(activeConversationId);
    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
    }, [activeConversationId]);

    const conversationsRef = useRef(conversations);
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    useEffect(() => {
        loadData();

        adminSupportSocket.connect((newMessage) => {
            const currentActiveId = activeConversationIdRef.current;
            const currentConvs = conversationsRef.current;
            const existingIndex = currentConvs.findIndex(c => c.id === newMessage.conversationId);

            if (existingIndex !== -1) {
                const conv = currentConvs[existingIndex];
                if (currentActiveId !== newMessage.conversationId) {
                    toast.success(`Tin nhắn mới từ ${conv.fullName || 'Khách hàng'}`, { position: 'bottom-right' });
                }
            }

            // Handle incoming message globally
            setConversations(prevConvs => {
                const index = prevConvs.findIndex(c => c.id === newMessage.conversationId);
                let updatedConvs = [...prevConvs];

                if (index !== -1) {
                    const conv = { ...updatedConvs[index] };
                    conv.lastMessage = newMessage.content;
                    conv.lastMessageAt = newMessage.createdAt;
                    
                    if (currentActiveId !== newMessage.conversationId) {
                        conv.adminUnreadCount = (conv.adminUnreadCount || 0) + 1;
                    } else {
                        // Pass new message to active conversation to display
                        conv.newMessage = newMessage;
                    }

                    // Move to top
                    updatedConvs.splice(index, 1);
                    updatedConvs.unshift(conv);
                } else {
                    // New conversation, reload data to fetch it properly with user info
                    loadData();
                }

                return updatedConvs;
            });

            // Update stats
            setStats(prev => ({
                ...prev,
                todayMessages: prev.todayMessages + 1,
                unreadConversations: currentActiveId !== newMessage.conversationId ? prev.unreadConversations + 1 : prev.unreadConversations
            }));
            
        }, () => {
            console.log("Admin connected to Support WebSocket");
        });

        return () => {
            adminSupportSocket.disconnect();
        };
    }, []);

    // Re-evaluate unread counts when active conversation changes
    useEffect(() => {
        if (activeConversationId) {
            handleMessagesRead();
        }
    }, [activeConversationId]);

    const loadData = async () => {
        try {
            const [convRes, statsRes] = await Promise.all([
                getAdminConversations(keyword),
                getAdminStatistics()
            ]);
            
            if (convRes.data && convRes.data.content) {
                setConversations(convRes.data.content);
            }
            if (statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu hỗ trợ:", err);
            toast.error("Không thể tải danh sách hỗ trợ");
        }
    };

    const handleSearch = (newKeyword) => {
        setKeyword(newKeyword);
        getAdminConversations(newKeyword).then(res => {
            if (res.data && res.data.content) {
                setConversations(res.data.content);
            }
        });
    };

    const handleSendMessage = (conversationId, content) => {
        adminSupportSocket.sendMessage(conversationId, content);
        
        // Update local conversation list
        setConversations(prev => prev.map(c => {
            if (c.id === conversationId) {
                return {
                    ...c,
                    lastMessage: content,
                    lastMessageAt: new Date().toISOString()
                };
            }
            return c;
        }));
    };

    const handleMessagesRead = async () => {
        if (!activeConversationId) return;

        try {
            await markAsReadAdmin(activeConversationId);
            
            // Update local state
            setConversations(prev => {
                let unreadCountDecreased = false;
                const newConvs = prev.map(c => {
                    if (c.id === activeConversationId && c.adminUnreadCount > 0) {
                        unreadCountDecreased = true;
                        return { ...c, adminUnreadCount: 0 };
                    }
                    return c;
                });
                
                if (unreadCountDecreased) {
                    setStats(s => ({ ...s, unreadConversations: Math.max(0, s.unreadConversations - 1) }));
                }
                
                return newConvs;
            });
        } catch (err) {
            console.error("Lỗi đánh dấu đã đọc:", err);
        }
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    return (
        <AdminLayout>
            <div className="container-fluid py-4" style={{ backgroundColor: '#F8F9FA', minHeight: 'calc(100vh - 60px)' }}>
                <h4 className="fw-bold mb-4">Hỗ trợ khách hàng</h4>
                
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10 me-3" style={{ width: '48px', height: '48px' }}>
                                    <i className="fa-solid fa-comment-dots text-danger fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Chưa đọc</h6>
                                    <h4 className="fw-bold mb-0 text-danger">{stats.unreadConversations}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 me-3" style={{ width: '48px', height: '48px' }}>
                                    <i className="fa-solid fa-users text-primary fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Khách hàng cần hỗ trợ</h6>
                                    <h4 className="fw-bold mb-0 text-primary">{stats.totalCustomers}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 me-3" style={{ width: '48px', height: '48px' }}>
                                    <i className="fa-solid fa-bolt text-success fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Tin nhắn hôm nay</h6>
                                    <h4 className="fw-bold mb-0 text-success">{stats.todayMessages}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row" style={{ height: 'calc(100vh - 220px)' }}>
                    <div className="col-md-4 h-100 pe-2">
                        <SupportConversationList 
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            onSelect={(conv) => setActiveConversationId(conv.id)}
                            keyword={keyword}
                            onSearch={handleSearch}
                        />
                    </div>
                    <div className="col-md-8 h-100 ps-2">
                        <AdminChatWindow 
                            activeConversation={activeConversation}
                            onSendMessage={handleSendMessage}
                            onMessagesRead={handleMessagesRead}
                            isConnected={adminSupportSocket.isConnected}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminSupportPage;
