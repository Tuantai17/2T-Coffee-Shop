import axios from 'axios';

// Giả định API Gateway chạy ở port 8900
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8900';

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('user.token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const getMyConversation = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/support/conversation/me`, {
            headers: getAuthHeaders()
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getMyMessages = async (page = 0, size = 50) => {
    try {
        const response = await axios.get(`${API_URL}/api/support/messages/me?page=${page}&size=${size}`, {
            headers: getAuthHeaders()
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const markAsRead = async () => {
    try {
        const response = await axios.patch(`${API_URL}/api/support/conversation/me/read`, null, {
            headers: getAuthHeaders()
        });
        return response;
    } catch (error) {
        throw error;
    }
};
