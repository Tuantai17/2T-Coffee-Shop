import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:8900';

class SupportSocketService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.onMessageReceived = null;
        this.onConnected = null;
    }

    connect(onMessageReceived, onConnected) {
        if (this.isConnected) return;
        
        const token = sessionStorage.getItem('user.token');
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

            const token = sessionStorage.getItem('user.token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userId = payload.userId;
                    if (userId) {
                        console.log("Subscribing to user support topic: " + userId);
                        // Subscribe to user specific topic
                        this.client.subscribe(`/topic/support/user/${userId}`, (message) => {
                            if (message.body) {
                                const parsedMsg = JSON.parse(message.body);
                                if (this.onMessageReceived) {
                                    this.onMessageReceived(parsedMsg);
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error("Error decoding token for userId", e);
                }
            }
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    sendMessage(content) {
        if (!this.isConnected || !this.client) {
            console.error('STOMP client not connected');
            return;
        }

        this.client.publish({
            destination: '/app/support/user-send',
            body: JSON.stringify({ content })
        });
    }

    disconnect() {
        if (this.client !== null) {
            this.client.deactivate();
            this.isConnected = false;
        }
    }
}

export default new SupportSocketService();
