import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SupportMessageList from './SupportMessageList';
import SupportMessageInput from './SupportMessageInput';
import supportSocket from '../../../../services/supportSocket';
import { getMyConversation, getMyMessages, markAsRead } from '../../../../services/supportApi';

function SupportChatWidget({ isOpen, onClose, onUnreadCountChange }) {
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('user.token'));

    // Check login status whenever the widget is opened
    useEffect(() => {
        if (isOpen) {
            setIsLoggedIn(!!sessionStorage.getItem('user.token'));
        }
    }, [isOpen]);

    const isOpenRef = useRef(isOpen);
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        if (isLoggedIn) {
            loadConversationAndMessages();
            
            supportSocket.connect((newMessage) => {
                setMessages(prev => {
                    if (prev.find(m => m.id === newMessage.id)) return prev;
                    
                    // Replace optimistic message if it matches
                    const optIndex = prev.findIndex(m => !m.id && m.content === newMessage.content && m.senderRole === newMessage.senderRole);
                    if (optIndex !== -1) {
                        const newMessages = [...prev];
                        newMessages[optIndex] = newMessage;
                        return newMessages;
                    }
                    
                    return [...prev, newMessage];
                });
                
                const currentIsOpen = isOpenRef.current;
                if (currentIsOpen && newMessage.senderRole === 'ADMIN') {
                    markAsRead().catch(console.error);
                } else if (!currentIsOpen && newMessage.senderRole === 'ADMIN') {
                    onUnreadCountChange(prev => prev + 1);
                }
            }, () => {
                console.log("Connected to Support WebSocket");
            });
        }
        return () => {
            supportSocket.disconnect();
        };
    }, [isLoggedIn]);

    useEffect(() => {
        if (isOpen && isLoggedIn && conversation?.customerUnreadCount > 0) {
            markAsRead().then(() => {
                onUnreadCountChange(0);
                setConversation(prev => ({ ...prev, customerUnreadCount: 0 }));
            }).catch(console.error);
        }
    }, [isOpen, conversation]);

    const loadConversationAndMessages = async () => {
        try {
            setLoading(true);
            const convRes = await getMyConversation();
            if (convRes.data) {
                setConversation(convRes.data);
                onUnreadCountChange(convRes.data.customerUnreadCount || 0);
                
                const msgRes = await getMyMessages(0, 100);
                if (msgRes.data && msgRes.data.content) {
                    setMessages(msgRes.data.content.reverse()); // backend is desc, we want asc
                }
            }
        } catch (err) {
            console.error("Failed to load chat history:", err);
            setError("Không thể tải lịch sử chat");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (content) => {
        if (!isLoggedIn) return;
        
        // Optimistic UI update
        const tempId = Date.now();
        const tempMsg = {
            id: null,
            content,
            senderRole: 'USER',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        
        supportSocket.sendMessage(content);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="position-fixed shadow-lg d-flex flex-column"
                    style={{
                        bottom: '85px',
                        right: '20px',
                        width: '380px',
                        height: '600px',
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        zIndex: 1050,
                        border: '1px solid #E7E7E7'
                    }}
                >
                    {/* Header */}
                    <div 
                        className="p-3 text-white d-flex align-items-center justify-content-between"
                        style={{ background: 'linear-gradient(135deg, #D86616 0%, #B94E0C 100%)' }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', color: '#D86616' }}>
                                <i className="fa-solid fa-headset fs-5" style={{ color: '#D86616' }}></i>
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold">Hỗ trợ khách hàng</h6>
                                <small style={{ fontSize: '0.75rem', opacity: 0.9 }}>Chúng tôi luôn sẵn sàng hỗ trợ bạn!</small>
                            </div>
                        </div>
                        <button 
                            className="btn btn-sm text-white p-1" 
                            onClick={onClose}
                            style={{ border: 'none', background: 'transparent' }}
                        >
                            <i className="fa-solid fa-times fs-5"></i>
                        </button>
                    </div>

                    {/* Content */}
                    {!isLoggedIn ? (
                        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 text-center bg-light">
                            <i className="fa-solid fa-lock text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <h6 className="text-muted mb-4">Vui lòng đăng nhập để sử dụng chức năng hỗ trợ khách hàng.</h6>
                            <Link to="/login" className="btn text-white px-4 py-2" style={{ backgroundColor: 'var(--primary-color)' }}>
                                Đăng nhập ngay
                            </Link>
                        </div>
                    ) : (
                        <>
                            {loading && messages.length === 0 ? (
                                <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
                                    <div className="spinner-border text-primary" role="status" style={{ color: '#D86616' }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <SupportMessageList messages={messages} currentUserRole="USER" />
                            )}
                            
                            <SupportMessageInput onSendMessage={handleSendMessage} disabled={!supportSocket.isConnected} />
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SupportChatWidget;
