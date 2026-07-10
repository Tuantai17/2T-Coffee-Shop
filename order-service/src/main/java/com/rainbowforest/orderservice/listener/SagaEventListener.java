package com.rainbowforest.orderservice.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.orderservice.domain.CompensationLog;
import com.rainbowforest.orderservice.repository.CompensationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SagaEventListener {

    @Autowired
    private CompensationLogRepository compensationLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "inventory-events", groupId = "order-saga-group")
    public void handleInventoryEvents(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.path("eventType").asText();
            
            if ("INVENTORY_RELEASED".equals(eventType) || "INVENTORY_RESTOCKED".equals(eventType)) {
                JsonNode payload = root.path("payload");
                Long orderId = payload.path("orderId").asLong();
                String sagaId = root.path("correlationId").asText(); // We passed sagaId as correlationId
                
                compensationLogRepository.findByOrderIdAndActionType(orderId, "RELEASE_INVENTORY")
                    .ifPresent(log -> {
                        log.setStatus("SUCCESS");
                        log.setCompletedAt(LocalDateTime.now());
                        compensationLogRepository.save(log);
                        System.out.println("Compensation successful for order: " + orderId);
                    });
            }
        } catch (Exception e) {
            System.err.println("Failed to process saga event: " + e.getMessage());
        }
    }
}
