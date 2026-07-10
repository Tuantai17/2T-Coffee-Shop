package com.rainbowforest.loyaltyservice.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.loyaltyservice.domain.EventEnvelope;
import com.rainbowforest.loyaltyservice.domain.ProcessedEvent;
import com.rainbowforest.loyaltyservice.repository.ProcessedEventRepository;
import com.rainbowforest.loyaltyservice.service.LoyaltyEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
public class OrderEventConsumer {

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @Autowired
    private LoyaltyEngineService loyaltyEngineService;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = {"order-completed", "order-events"}, groupId = "loyalty-service-group")
    @Transactional
    public void consumeOrderEvent(String message) {
        try {
            EventEnvelope envelope = objectMapper.readValue(message, EventEnvelope.class);
            String eventId = envelope.getEventId();
            String eventType = envelope.getEventType();

            // Idempotency Check
            if (processedEventRepository.findByEventId(eventId).isPresent()) {
                return; // Already processed
            }

            if ("ORDER_COMPLETED".equals(eventType) || "ORDER_CANCELLED".equals(eventType) || "ORDER_REFUNDED".equals(eventType)) {
                Map<String, Object> payload = (Map<String, Object>) envelope.getPayload();
                
                Long userId = getLongValue(payload.get("userId"));
                Long orderId = getLongValue(payload.get("orderId"));

                if (userId == null || orderId == null) {
                    System.err.println("Invalid payload missing userId or orderId in loyalty service");
                    return;
                }

                if ("ORDER_COMPLETED".equals(eventType)) {
                    long productSubtotal = getLongValue(payload.get("productSubtotal"));
                    long productDiscount = getLongValue(payload.get("productDiscount"));
                    long voucherDiscount = getLongValue(payload.get("voucherDiscount"));
                    long pointsDiscount = getLongValue(payload.get("pointsDiscount"));
                    long refundedProductAmount = getLongValue(payload.get("refundedProductAmount"));
                    
                    loyaltyEngineService.processOrderCompleted(userId, orderId, productSubtotal, productDiscount, voucherDiscount, pointsDiscount, refundedProductAmount);
                } else if ("ORDER_CANCELLED".equals(eventType)) {
                    // Canceled before shipping, no points awarded yet (if reservation used, it will release. MVP skips reservation)
                } else if ("ORDER_REFUNDED".equals(eventType)) {
                    long refundAmount = getLongValue(payload.get("refundAmount"));
                    loyaltyEngineService.processOrderCancelledOrRefunded(userId, orderId, refundAmount);
                }
            }

            // Mark as processed
            ProcessedEvent processedEvent = new ProcessedEvent();
            processedEvent.setEventId(eventId);
            processedEvent.setEventType(eventType);
            processedEvent.setStatus("PROCESSED");
            processedEventRepository.save(processedEvent);

        } catch (Exception e) {
            System.err.println("Failed to process message in Loyalty Consumer: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Long getLongValue(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
