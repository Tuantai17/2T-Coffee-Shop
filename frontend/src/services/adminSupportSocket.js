import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:8900';

class AdminSupportSocketService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.onMessageReceived = null;
        this.onConnected = null;
    }

    connect(onMessageReceived, onConnected) {
        if (this.isConnected) return;
        
        const token = sessionStorage.getItem('admin.token');
        if (!token) return;

        this.onMessageReceived = onMessageReceived;
        this.onConnected = onConnected;

        this.client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws-support`),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        this.client.onConnect = (frame) => {
            this.isConnected = true;
            if (this.onConnected) this.onConnected();

            // Subscribe to global admin support topic
            this.client.subscribe('/topic/admin/support', (message) => {
                if (message.body) {
                    const parsedMsg = JSON.parse(message.body);
                    if (this.onMessageReceived) {
                        this.onMessageReceived(parsedMsg);
                    }
                }
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    sendMessage(conversationId, content) {
        if (!this.isConnected || !this.client) {
            console.error('STOMP client not connected');
            return;
        }

        this.client.publish({
            destination: '/app/support/admin-send',
            body: JSON.stringify({ conversationId, content })
        });
    }

    disconnect() {
        if (this.client !== null) {
            this.client.deactivate();
            this.isConnected = false;
        }
    }
}

export default new AdminSupportSocketService();
