import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8900';

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('admin.token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const getAdminConversations = async (keyword = '', page = 0, size = 20) => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/support/conversations?keyword=${keyword}&page=${page}&size=${size}`, {
            headers: getAuthHeaders()
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAdminMessages = async (conversationId, page = 0, size = 50) => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/support/conversations/${conversationId}/messages?page=${page}&size=${size}`, {
            headers: getAuthHeaders()
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const markAsReadAdmin = async (conversationId) => {
    try {
        const response = await axios.patch(`${API_URL}/api/admin/support/conversations/${conversationId}/read`, null, {
            headers: getAuthHeaders()
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAdminStatistics = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/support/statistics`, {
            headers: getAuthHeaders()
        });
        return response;
    } catch (error) {
        throw error;
    }
};
