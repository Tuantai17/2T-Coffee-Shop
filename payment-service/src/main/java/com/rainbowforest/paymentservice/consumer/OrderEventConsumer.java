package com.rainbowforest.paymentservice.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

import com.rainbowforest.paymentservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);

    @Autowired
    private PaymentService paymentService;

    @KafkaListener(topics = "order-events", groupId = "payment-group")
    public void consumeOrderEvent(Map<String, Object> envelope) {
        String eventType = (String) envelope.get("eventType");
        log.info("PAYMENT SERVICE: Received event type: {}", eventType);
        
        if ("ORDER_CANCELLED".equals(eventType) || "ORDER_STATUS_CHANGED".equals(eventType)) {
            Map<String, Object> payload = (Map<String, Object>) envelope.get("payload");
            if (payload == null) return;
            
            String newStatus = (String) payload.get("newStatus");
            String status = (String) payload.get("status");
            
            // Allow processing if event is specifically ORDER_CANCELLED or status changed to CANCELLED
            if ("ORDER_CANCELLED".equals(eventType) || "CANCELLED".equals(newStatus) || "CANCELLED".equals(status)) {
                Object orderIdObj = payload.get("orderId");
                if (orderIdObj != null) {
                    Long orderId = Long.valueOf(orderIdObj.toString());
                    log.info("PAYMENT SERVICE: Processing auto-refund for cancelled order {}", orderId);
                    try {
                        paymentService.refundPaymentByOrderId(orderId);
                        log.info("PAYMENT SERVICE: Auto-refund complete for order {}", orderId);
                    } catch (Exception e) {
                        log.error("PAYMENT SERVICE: Failed to process refund for order {}: {}", orderId, e.getMessage(), e);
                    }
                }
            }
        }
    }
}
