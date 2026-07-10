package com.rainbowforest.notificationservice.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.notificationservice.domain.ProcessedEvent;
import com.rainbowforest.notificationservice.repository.ProcessedEventRepository;
import com.rainbowforest.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventConsumer {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = {"order-events", "user-events", "payment-events", "loyalty-events"}, groupId = "notification-group")
    public void processEvent(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventId = root.path("eventId").asText();
            String eventType = root.path("eventType").asText();

            // Idempotency check
            if (eventId == null || eventId.isBlank()) return;
            
            try {
                processedEventRepository.save(new ProcessedEvent(eventId, eventType));
            } catch (DuplicateKeyException ex) {
                System.out.println("Duplicate event detected, ignoring: " + eventId);
                return;
            }

            JsonNode payload = root.path("payload");
            
            switch (eventType) {
                case "ORDER_CREATED":
                    handleOrderCreated(payload);
                    break;
                case "ORDER_CONFIRMED":
                    handleOrderConfirmed(payload);
                    break;
                case "ORDER_SHIPPING":
                    handleOrderShipping(payload);
                    break;
                case "USER_REGISTERED":
                    handleUserRegistered(payload);
                    break;
                case "PAYMENT_SUCCESS":
                    handlePaymentSuccess(payload);
                    break;
                case "CHECKIN_REWARD_GRANTED":
                    handleCheckinReward(payload);
                    break;
                case "MINIGAME_REWARD_GRANTED":
                    handleGameReward(payload);
                    break;
                default:
                    System.out.println("Unhandled event type for notification: " + eventType);
            }

        } catch (Exception ex) {
            System.err.println("Failed to process event for notification: " + ex.getMessage());
            throw new RuntimeException(ex); // Bubble up for Kafka retry/DLT
        }
    }

    private void handleOrderCreated(JsonNode payload) {
        Long userId = payload.path("userId").asLong();
        Long orderId = payload.path("orderId").asLong();
        String title = "Đơn hàng mới #" + orderId;
        String message = "Đơn hàng #" + orderId + " của bạn đã được tạo thành công và đang chờ xác nhận.";
        String email = payload.path("email").asText(null); // Assuming email is in payload or we can fetch it, actually let's just pass null to mock for now
        
        notificationService.createAndSendNotification(userId, email, "ORDER_CREATED", title, message, "ORDER", String.valueOf(orderId));
    }

    private void handleOrderConfirmed(JsonNode payload) {
        Long userId = payload.path("userId").asLong();
        Long orderId = payload.path("orderId").asLong();
        String title = "Đơn hàng #" + orderId + " đã được xác nhận";
        String message = "Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.";
        String email = payload.path("email").asText(null); 
        
        notificationService.createAndSendNotification(userId, email, "ORDER_CONFIRMED", title, message, "ORDER", String.valueOf(orderId));
    }
    
    private void handleOrderShipping(JsonNode payload) {
        Long userId = payload.path("userId").asLong();
        Long orderId = payload.path("orderId").asLong();
        String title = "Đơn hàng #" + orderId + " đang được giao";
        String message = "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển.";
        String email = payload.path("email").asText(null); 
        
        notificationService.createAndSendNotification(userId, email, "ORDER_SHIPPING", title, message, "ORDER", String.valueOf(orderId));
    }

    private void handleUserRegistered(JsonNode payload) {
        Long userId = payload.path("userId").asLong();
        String title = "Chào mừng bạn!";
        String message = "Cảm ơn bạn đã đăng ký tài khoản.";
        String email = payload.path("email").asText(null); 
        
        notificationService.createAndSendNotification(userId, email, "USER_REGISTERED", title, message, "USER", String.valueOf(userId));
    }

    private void handlePaymentSuccess(JsonNode payload) {
        Long userId = payload.path("userId").asLong();
        Long orderId = payload.path("orderId").asLong();
        String transactionId = payload.path("transactionId").asText("");
        String title = "Thanh toán thành công";
        String message = "Đơn hàng #" + orderId + " đã được thanh toán thành công (GD: " + transactionId + ").";
        
        notificationService.createAndSendNotification(userId, null, "PAYMENT_SUCCESS", title, message, "ORDER", String.valueOf(orderId));
    }

    private void handleCheckinReward(JsonNode payload) {
        Long userId = payload.path("userId").asLong();
        String rewardType = payload.path("rewardType").asText("");
        String rewardValue = payload.path("rewardValue").asText("");
        String title = "Điểm danh nhận thưởng";
        String message = "Bạn đã điểm danh thành công và nhận được " + rewardValue + ("POINTS".equals(rewardType) ? " điểm" : " voucher") + "!";
        
        notificationService.createAndSendNotification(userId, null, "CHECKIN_REWARD", title, message, "LOYALTY", "CHECKIN");
    }

    private void handleGameReward(JsonNode payload) {
        Long userId = payload.path("userId").asLong();
        String sessionId = payload.path("sessionId").asText("");
        String rewardType = payload.path("rewardType").asText("");
        String rewardValue = payload.path("rewardValue").asText("");
        String title = "Phần thưởng trò chơi";
        String message = "Chúc mừng bạn đã chiến thắng! Nhận được " + rewardValue + ("POINTS".equals(rewardType) ? " điểm" : " voucher") + "!";
        
        notificationService.createAndSendNotification(userId, null, "GAME_REWARD", title, message, "GAME", sessionId);
    }
}
