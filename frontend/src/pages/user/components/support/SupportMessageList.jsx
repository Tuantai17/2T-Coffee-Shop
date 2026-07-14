import React, { useEffect, useRef } from 'react';

function SupportMessageList({ messages, currentUserRole }) {
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: '#F8F8F8' }}>
            <div className="text-center mb-3">
                <span className="badge bg-light text-muted border">Hôm nay</span>
            </div>

            {messages.length === 0 && (
                <div className="d-flex mb-3 justify-content-start">
                    <div
                        className="p-3 shadow-sm"
                        style={{
                            maxWidth: '75%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            borderBottomLeftRadius: '4px',
                            border: '1px solid #E7E7E7',
                            color: '#272727'
                        }}
                    >
                        <p className="mb-0">Xin chào!<br />Cảm ơn bạn đã liên hệ với BrewMoments.<br />Bạn cần hỗ trợ điều gì ạ?</p>
                    </div>
                </div>
            )}

            {messages.map((msg, index) => {
                const isMine = msg.senderRole === currentUserRole;
                
                return (
                    <div key={msg.id ? `msg-${msg.id}` : `temp-${index}`} className={`d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div
                            className="p-3 shadow-sm"
                            style={{
                                maxWidth: '75%',
                                backgroundColor: isMine ? '#FFF1E5' : '#FFFFFF',
                                borderRadius: '16px',
                                borderBottomRightRadius: isMine ? '4px' : '16px',
                                borderBottomLeftRadius: !isMine ? '4px' : '16px',
                                border: !isMine ? '1px solid #E7E7E7' : 'none',
                                color: isMine ? '#B94E0C' : '#272727'
                            }}
                        >
                            <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                            <div className={`text-end ${isMine ? 'text-muted' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                {formatTime(msg.createdAt)}
                                {isMine && msg.id && <i className="fa-solid fa-check ms-1"></i>}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={endOfMessagesRef} />
        </div>
    );
}

export default SupportMessageList;
