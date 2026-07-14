import React, { useState, useEffect, useRef } from 'react';
import SupportMessageList from '../../user/components/support/SupportMessageList';
import SupportMessageInput from '../../user/components/support/SupportMessageInput';
import { getAdminMessages } from '../../../services/adminSupportApi';

function AdminChatWindow({ activeConversation, onSendMessage, onMessagesRead, isConnected }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.id);
        } else {
            setMessages([]);
        }
    }, [activeConversation?.id]);

    // Expose method to append a message from the parent component (received via WebSocket)
    useEffect(() => {
        if (activeConversation && activeConversation.newMessage) {
            setMessages(prev => {
                if (prev.find(m => m.id === activeConversation.newMessage.id)) return prev;
                return [...prev, activeConversation.newMessage];
            });
            onMessagesRead(); // Mark as read when new message arrives and conversation is active
        }
    }, [activeConversation?.newMessage]);

    const loadMessages = async (conversationId) => {
        try {
            setLoading(true);
            const res = await getAdminMessages(conversationId, 0, 100);
            if (res.data && res.data.content) {
                setMessages(res.data.content.reverse());
            }
            onMessagesRead();
        } catch (err) {
            console.error("Lỗi tải tin nhắn:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = (content) => {
        if (!activeConversation) return;

        // Optimistic update
        const tempMsg = {
            id: null,
            content,
            senderRole: 'ADMIN',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        onSendMessage(activeConversation.id, content);
    };

    if (!activeConversation) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 bg-white" style={{ borderRadius: '12px', border: '1px solid #E7E7E7' }}>
                <div className="text-center text-muted">
                    <i className="fa-regular fa-comments mb-3" style={{ fontSize: '3rem' }}></i>
                    <h5 className="fw-bold">Chọn một khách hàng để bắt đầu hỗ trợ.</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column h-100 bg-white" style={{ borderRadius: '12px', border: '1px solid #E7E7E7', overflow: 'hidden' }}>
            {/* Header */}
            <div className="p-3 border-bottom d-flex align-items-center gap-3">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="fa-solid fa-user text-muted fs-4"></i>
                </div>
                <div>
                    <h6 className="mb-0 fw-bold">{activeConversation.fullName || 'Khách hàng'}</h6>
                    <small className="text-success"><i className="fa-solid fa-circle ms-1" style={{ fontSize: '8px' }}></i> Đang hoạt động</small>
                </div>
            </div>

            {/* Message List */}
            {loading ? (
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <SupportMessageList messages={messages} currentUserRole="ADMIN" />
            )}

            {/* Input */}
            <SupportMessageInput onSendMessage={handleSend} disabled={!isConnected} />
        </div>
    );
}

export default AdminChatWindow;
