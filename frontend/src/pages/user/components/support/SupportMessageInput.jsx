import React, { useState } from 'react';

function SupportMessageInput({ onSendMessage, disabled }) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (trimmed && !disabled) {
            onSendMessage(trimmed);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex p-3 border-top bg-white" style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
            <textarea
                className="form-control me-2"
                rows="1"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                style={{ resize: 'none', borderRadius: '20px', padding: '10px 15px', overflow: 'hidden' }}
                maxLength={2000}
            />
            <button
                type="submit"
                className="btn text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '45px', height: '45px', backgroundColor: 'var(--primary-color)', flexShrink: 0 }}
                disabled={!message.trim() || disabled}
                title="Gửi"
            >
                <i className="fa-solid fa-paper-plane"></i>
            </button>
        </form>
    );
}

export default SupportMessageInput;
