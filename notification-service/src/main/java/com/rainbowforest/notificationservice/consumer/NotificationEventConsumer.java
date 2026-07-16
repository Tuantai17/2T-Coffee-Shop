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

import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationEventConsumer {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = {"order-events", "user-events", "support-events", "loyalty-events", "notification-events"}, groupId = "notification-group")
    public void processEvent(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            if (root.isTextual()) {
                root = objectMapper.readTree(root.asText());
            }
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
                    handleOrderCreated(eventId, payload);
                    break;
                case "ORDER_STATUS_CHANGED":
                    handleOrderStatusChanged(eventId, payload);
                    break;
                case "SUPPORT_MESSAGE_CREATED":
                    handleSupportMessage(eventId, payload);
                    break;
                case "CONTACT_CREATED":
                    handleContactCreated(eventId, payload);
                    break;
                case "CHECKIN_REMINDER":
                    handleCheckinReminder(eventId, payload);
                    break;
                case "USER_REGISTERED":
                    // Keep for backward compatibility or future use
                    break;
                case "PAYMENT_SUCCESS":
                    // Handled inside ORDER_STATUS_CHANGED or similarly
                    break;
                default:
                    System.out.println("Unhandled event type for notification: " + eventType);
            }

        } catch (Exception ex) {
            System.err.println("Failed to process event for notification: " + ex.getMessage());
            throw new RuntimeException(ex); // Bubble up for Kafka retry/DLT
        }
    }

    private void handleOrderCreated(String eventId, JsonNode payload) {
        String orderId = payload.path("orderId").asText();
        String userId = payload.path("userId").asText(null);
        String customerEmail = payload.path("customerEmail").asText(null);
        
        String title = "Đơn hàng mới #" + orderId;
        String message = "Khách hàng vừa đặt một đơn hàng mới #" + orderId + ". Vui lòng kiểm tra.";
        String idempotencyKey = "ORDER_CREATED_ADMIN:" + orderId;

        String orderCode = payload.path("orderCode").asText(orderId);
        String recipientName = payload.path("recipientName").asText("Bạn");
        JsonNode itemsNode = payload.path("items");
        Object items = null;
        if (itemsNode != null && itemsNode.isArray()) {
            try {
                items = objectMapper.readValue(itemsNode.traverse(), Object.class);
            } catch (Exception e) {}
        }
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("orderCode", orderCode);
        metadata.put("recipientName", recipientName);
        metadata.put("subtotal", payload.path("subtotal").asDouble(0));
        metadata.put("shippingFee", payload.path("shippingFee").asDouble(0));
        metadata.put("discountAmount", payload.path("discountAmount").asDouble(0));
        metadata.put("total", payload.path("total").asDouble(0));
        if (items != null) {
            metadata.put("items", items);
        }

        // Notify Admin
        notificationService.createAndSendNotification(
                eventId, idempotencyKey, "ADMIN", "ADMIN", "ORDER_CREATED", "ORDER",
                title, message, "/admin/orders/" + orderId, orderId, metadata, 
                "true".equalsIgnoreCase(System.getenv("MAIL_ADMIN_ALERTS_ENABLED")), System.getenv("ADMIN_ALERT_EMAIL")
        );
        
        // Notify User
        if (userId != null && !userId.isBlank() && !"null".equals(userId)) {
            String userTitle = "Đặt hàng thành công";
            String userMessage = "Cảm ơn bạn! Đơn hàng #" + orderCode + " đã được đặt thành công và đang chờ xác nhận.";
            String userIdempotencyKey = "ORDER_CREATED_USER:" + orderId;
            notificationService.createAndSendNotification(
                    eventId + "_USER", userIdempotencyKey, userId, "USER", "ORDER_CREATED", "ORDER",
                    userTitle, userMessage, "/profile/orders", orderId, metadata,
                    true, customerEmail
            );
        }
    }

    private void handleOrderStatusChanged(String eventId, JsonNode payload) {
        String userId = payload.path("userId").asText();
        String orderId = payload.path("orderId").asText();
        String status = payload.path("status").asText();
        String customerEmail = payload.path("customerEmail").asText(null);
        
        String title = "Cập nhật đơn hàng #" + orderId;
        String message = getStatusMessage(status, orderId);
        String idempotencyKey = "ORDER_STATUS_CHANGED:" + orderId + ":" + status;

        if (message != null) {
            String targetUserId = (userId != null && !userId.isBlank() && !"null".equals(userId)) ? userId : "GUEST";
            notificationService.createAndSendNotification(
                    eventId, idempotencyKey, targetUserId, targetUserId.equals("GUEST") ? "GUEST" : "USER", "ORDER_STATUS_CHANGED", "ORDER",
                    title, message, "/profile/orders", orderId, Map.of("status", status),
                    true, customerEmail
            );
        }
    }

    private String getStatusMessage(String status, String orderId) {
        switch (status) {
            case "CONFIRMED": return "Đơn hàng #" + orderId + " đã được xác nhận.";
            case "PREPARING": return "Đơn hàng #" + orderId + " đang được chuẩn bị.";
            case "READY": return "Đơn hàng #" + orderId + " đã chuẩn bị xong, chờ giao/nhận.";
            case "DELIVERING": return "Đơn hàng #" + orderId + " đang được giao đến bạn.";
            case "COMPLETED": return "Đơn hàng #" + orderId + " đã hoàn thành. Cảm ơn bạn!";
            case "CANCELLED": return "Đơn hàng #" + orderId + " đã bị hủy.";
            default: return null;
        }
    }

    private void handleSupportMessage(String eventId, JsonNode payload) {
        String conversationId = payload.path("conversationId").asText();
        String senderRole = payload.path("senderRole").asText();
        String userId = payload.path("userId").asText();
        String customerEmail = payload.path("customerEmail").asText(null);
        String idempotencyKey = "SUPPORT_MESSAGE:" + eventId;

        if ("USER".equalsIgnoreCase(senderRole)) {
            // Notify Admin
            notificationService.createAndSendNotification(
                    eventId, idempotencyKey, "ADMIN", "ADMIN", "SUPPORT_MESSAGE", "SUPPORT",
                    "Tin nhắn hỗ trợ mới", "Khách hàng " + userId + " vừa gửi tin nhắn.", 
                    "/admin/support?conversationId=" + conversationId, conversationId, new HashMap<>(),
                    "true".equalsIgnoreCase(System.getenv("MAIL_ADMIN_ALERTS_ENABLED")), System.getenv("ADMIN_ALERT_EMAIL")
            );
        } else if ("ADMIN".equalsIgnoreCase(senderRole)) {
            // Notify User
            notificationService.createAndSendNotification(
                    eventId, idempotencyKey, userId, "USER", "SUPPORT_MESSAGE", "SUPPORT",
                    "Phản hồi hỗ trợ", "Nhân viên đã trả lời tin nhắn của bạn.", 
                    "/account/support?conversationId=" + conversationId, conversationId, new HashMap<>(),
                    true, customerEmail
            );
        }
    }

    private void handleContactCreated(String eventId, JsonNode payload) {
        String contactId = payload.path("contactId").asText();
        String idempotencyKey = "CONTACT_CREATED:" + contactId;

        notificationService.createAndSendNotification(
                eventId, idempotencyKey, "ADMIN", "ADMIN", "CONTACT_CREATED", "CONTACT",
                "Liên hệ mới", "Khách hàng vừa gửi biểu mẫu liên hệ.", 
                "/admin/contacts/" + contactId, contactId, new HashMap<>(),
                "true".equalsIgnoreCase(System.getenv("MAIL_ADMIN_ALERTS_ENABLED")), System.getenv("ADMIN_ALERT_EMAIL")
        );
    }

    private void handleCheckinReminder(String eventId, JsonNode payload) {
        String userId = payload.path("userId").asText();
        String idempotencyKey = payload.path("idempotencyKey").asText();
        String customerEmail = payload.path("customerEmail").asText(null);
        String title = payload.path("title").asText("Nhắc nhở điểm danh!");
        String message = payload.path("message").asText("Đừng quên điểm danh hôm nay để nhận điểm thưởng nhé.");
        boolean emailRequired = payload.path("emailRequired").asBoolean(false);

        notificationService.createAndSendNotification(
                eventId, idempotencyKey, userId, "USER", "CHECKIN_REMINDER", "CHECKIN",
                title, message, "/account/check-in", null, new HashMap<>(),
                emailRequired, customerEmail
        );
    }
}
