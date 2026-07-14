package com.rainbowforest.notificationservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.rainbowforest.notificationservice.domain.EmailDeliveryLog;
import com.rainbowforest.notificationservice.repository.EmailDeliveryLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailNotificationHandler {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationHandler.class);

    private final EmailSenderService emailSenderService;
    private final EmailTemplateService emailTemplateService;
    private final EmailDeliveryLogRepository emailDeliveryLogRepository;

    public EmailNotificationHandler(
            EmailSenderService emailSenderService,
            EmailTemplateService emailTemplateService,
            EmailDeliveryLogRepository emailDeliveryLogRepository) {
        this.emailSenderService = emailSenderService;
        this.emailTemplateService = emailTemplateService;
        this.emailDeliveryLogRepository = emailDeliveryLogRepository;
    }

    public void processEmailEvent(JsonNode payload, String eventId, String eventType) {
        String idempotencyKey = eventType + ":" + eventId;
        
        // 1. Check Idempotency
        if (emailDeliveryLogRepository.findById(idempotencyKey).isPresent()) {
            log.info("Email event already processed: {}", idempotencyKey);
            return;
        }

        EmailDeliveryLog emailLog = new EmailDeliveryLog();
        emailLog.setId(idempotencyKey);
        emailLog.setEventId(eventId);
        emailLog.setIdempotencyKey(idempotencyKey);
        emailLog.setEventType(eventType);

        try {
            // Save initial PENDING state
            emailDeliveryLogRepository.save(emailLog);
        } catch (DuplicateKeyException ex) {
            log.info("Duplicate email event detected during save: {}", idempotencyKey);
            return;
        }

        try {
            // 2. Extract Data
            String recipientEmail = payload.path("recipientEmail").asText(null);
            if (recipientEmail == null || recipientEmail.isBlank()) {
                recipientEmail = payload.path("email").asText(null); // Fallback
            }
            
            if (recipientEmail == null || recipientEmail.isBlank()) {
                log.warn("Recipient email is missing for event {}", eventId);
                emailLog.setStatus("SKIPPED");
                emailLog.setLastError("Missing recipient email");
                emailDeliveryLogRepository.save(emailLog);
                return;
            }

            emailLog.setRecipientEmail(recipientEmail);
            emailLog.setRecipientName(payload.path("recipientName").asText("Customer"));
            emailLog.setUserId(payload.path("userId").asLong(0));
            emailLog.setOrderId(payload.path("orderId").asLong(0));
            emailLog.setOrderCode(payload.path("orderCode").asText(null));

            // 3. Render Template
            String templateName = determineTemplate(eventType);
            emailLog.setTemplateCode(templateName);
            
            String subject = determineSubject(eventType, payload);
            emailLog.setSubject(subject);
            
            Map<String, Object> variables = extractVariables(eventType, payload);
            variables.put("recipientName", emailLog.getRecipientName());
            
            String htmlContent = emailTemplateService.generateEmail(templateName, variables);

            // 4. Send Email
            emailSenderService.sendHtmlEmail(recipientEmail, subject, htmlContent);

            // 5. Update Status
            emailLog.setStatus("SENT");
            emailLog.setSentAt(LocalDateTime.now());
            emailDeliveryLogRepository.save(emailLog);

        } catch (Exception ex) {
            log.error("Failed to send email for event {}", eventId, ex);
            emailLog.setStatus("FAILED");
            emailLog.setLastError(ex.getMessage());
            emailLog.setRetryCount(emailLog.getRetryCount() + 1);
            emailDeliveryLogRepository.save(emailLog);
            throw new RuntimeException("Email sending failed, triggering retry", ex);
        }
    }

    private String determineTemplate(String eventType) {
        return switch (eventType) {
            case "USER_FORGOT_PASSWORD_OTP" -> "forgot-password-otp";
            case "USER_PASSWORD_RESET_SUCCESS" -> "password-reset-success";
            case "USER_PASSWORD_CHANGED" -> "password-change-success";
            case "ORDER_CREATED" -> "order-created";
            case "PAYMENT_SUCCESS" -> "payment-success";
            case "ORDER_STATUS_CHANGED" -> "order-status-changed";
            case "DAILY_CHECKIN_REMINDER" -> "checkin-reminder";
            default -> "default-template";
        };
    }

    private String determineSubject(String eventType, JsonNode payload) {
        return switch (eventType) {
            case "USER_FORGOT_PASSWORD_OTP" -> "[BrewMoments] Mã xác thực đặt lại mật khẩu";
            case "USER_PASSWORD_RESET_SUCCESS", "USER_PASSWORD_CHANGED" -> "[BrewMoments] Thông báo bảo mật tài khoản";
            case "ORDER_CREATED" -> "[BrewMoments] Xác nhận đơn hàng #" + payload.path("orderCode").asText("");
            case "PAYMENT_SUCCESS" -> "[BrewMoments] Thanh toán thành công đơn hàng #" + payload.path("orderCode").asText("");
            case "ORDER_STATUS_CHANGED" -> "[BrewMoments] Cập nhật trạng thái đơn hàng #" + payload.path("orderCode").asText("");
            case "DAILY_CHECKIN_REMINDER" -> "[BrewMoments] Đừng quên điểm danh hôm nay";
            default -> "[BrewMoments] Thông báo từ hệ thống";
        };
    }

    private Map<String, Object> extractVariables(String eventType, JsonNode payload) {
        Map<String, Object> variables = new HashMap<>();
        // Default conversion of flat payload properties
        payload.fields().forEachRemaining(entry -> {
            if (entry.getValue().isTextual()) {
                variables.put(entry.getKey(), entry.getValue().asText());
            } else if (entry.getValue().isNumber()) {
                variables.put(entry.getKey(), entry.getValue().numberValue());
            } else if (entry.getValue().isBoolean()) {
                variables.put(entry.getKey(), entry.getValue().asBoolean());
            }
        });
        
        // Custom parsing
        if ("ORDER_CREATED".equals(eventType) || "ORDER_STATUS_CHANGED".equals(eventType) || "PAYMENT_SUCCESS".equals(eventType)) {
            if (payload.has("items") && payload.path("items").isArray()) {
                // we can pass the raw JSON node to Thymeleaf or map it to a list of maps.
                // It's safer to map it to a list of maps
                java.util.List<Map<String, Object>> items = new java.util.ArrayList<>();
                for (JsonNode itemNode : payload.path("items")) {
                    Map<String, Object> item = new HashMap<>();
                    itemNode.fields().forEachRemaining(entry -> item.put(entry.getKey(), entry.getValue().asText()));
                    items.add(item);
                }
                variables.put("items", items);
            }
        }
        return variables;
    }
}
