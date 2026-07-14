import React from 'react';

function SupportConversationList({ conversations, activeConversationId, onSelect, keyword, onSearch }) {

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    return (
        <div className="d-flex flex-column h-100 bg-white" style={{ borderRadius: '12px', border: '1px solid #E7E7E7' }}>
            <div className="p-3 border-bottom">
                <h6 className="fw-bold mb-3">Danh sách hội thoại</h6>
                <div className="position-relative">
                    <input 
                        type="text" 
                        className="form-control ps-4" 
                        placeholder="Tìm kiếm khách hàng..." 
                        value={keyword}
                        onChange={(e) => onSearch(e.target.value)}
                        style={{ borderRadius: '8px' }}
                    />
                    <i className="fa-solid fa-search position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}></i>
                </div>
            </div>
            
            <div className="flex-grow-1 overflow-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-muted">
                        Chưa có cuộc trò chuyện nào.
                    </div>
                ) : (
                    <ul className="list-group list-group-flush">
                        {conversations.map(conv => (
                            <li 
                                key={conv.id} 
                                className={`list-group-item list-group-item-action border-0 py-3 cursor-pointer ${activeConversationId === conv.id ? 'bg-light' : ''}`}
                                onClick={() => onSelect(conv)}
                                style={{ 
                                    backgroundColor: activeConversationId === conv.id ? '#FFF1E5' : 'transparent',
                                    borderLeft: activeConversationId === conv.id ? '4px solid #D86616' : '4px solid transparent'
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '75%' }}>
                                        {conv.fullName || 'Khách hàng'}
                                        {conv.adminUnreadCount > 0 && (
                                            <span className="badge rounded-pill" style={{ backgroundColor: '#D95C12' }}>{conv.adminUnreadCount}</span>
                                        )}
                                    </h6>
                                    <small className="text-muted">{formatTime(conv.lastMessageAt)}</small>
                                </div>
                                <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.85rem' }}>
                                    {conv.lastMessage || 'Chưa có tin nhắn'}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default SupportConversationList;
