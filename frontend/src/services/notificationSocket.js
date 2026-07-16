import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:8900';

class NotificationSocketService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.onMessageReceived = null;
    }

    connect(onMessageReceived) {
        if (this.client && this.client.active) return;
        if (this.isConnecting) return;
        
        let token = sessionStorage.getItem('admin.token');
        if (!token) {
            token = sessionStorage.getItem('user.token');
        }
        if (!token) return;

        this.onMessageReceived = onMessageReceived;
        this.isConnecting = true;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws-notifications`),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        stompClient.onConnect = (frame) => {
            this.isConnected = true;
            this.isConnecting = false;
            console.log("Connected to notification websocket");
            
            stompClient.subscribe(`/user/queue/notifications`, (message) => {
                if (message.body) {
                    const parsedMsg = JSON.parse(message.body);
                    if (this.onMessageReceived) {
                        this.onMessageReceived(parsedMsg);
                    }
                    window.dispatchEvent(new Event("notifications_updated"));
                }
            });
        };

        stompClient.onStompError = (frame) => {
            this.isConnecting = false;
            console.error('Notification Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        stompClient.onWebSocketClose = () => {
            this.isConnected = false;
            this.isConnecting = false;
        };

        this.client = stompClient;
        this.client.activate();
    }

    disconnect() {
        if (this.client !== null) {
            this.client.deactivate();
            this.client = null;
            this.isConnected = false;
            this.isConnecting = false;
        }
    }
}

export default new NotificationSocketService();
