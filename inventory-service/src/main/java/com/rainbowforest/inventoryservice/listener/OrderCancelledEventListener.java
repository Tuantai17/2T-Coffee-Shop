package com.rainbowforest.inventoryservice.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.inventoryservice.domain.ProcessedEvent;
import com.rainbowforest.inventoryservice.repository.ProcessedEventRepository;
import com.rainbowforest.inventoryservice.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OrderCancelledEventListener {

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "inventory-group")
    @Transactional
    public void handleOrderEvents(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventId = root.path("eventId").asText();
            String eventType = root.path("eventType").asText();
            
            if ("ORDER_CANCELLED".equals(eventType)) {
                try {
                    ProcessedEvent processedEvent = new ProcessedEvent();
                    processedEvent.setEventId(eventId);
                    processedEvent.setEventType(eventType);
                    processedEvent.setConsumerName("inventory-service-saga");
                    processedEvent.setStatus("COMPLETED");
                    processedEventRepository.saveAndFlush(processedEvent);
                    
                    JsonNode payload = root.path("payload");
                    Long orderId = payload.path("orderId").asLong();
                    
                    // Release Inventory
                    inventoryService.releaseReservation(orderId);
                    
                    // Reply to Kafka
                    String replyEvent = String.format(
                        "{\"eventId\":\"%s\", \"eventType\":\"INVENTORY_RELEASED\", \"correlationId\":\"%s\", \"payload\":{\"orderId\":%d}}",
                        java.util.UUID.randomUUID().toString(),
                        root.path("correlationId").asText(),
                        orderId
                    );
                    kafkaTemplate.send("inventory-events", replyEvent);
                    System.out.println("Inventory released and replied for order: " + orderId);
                    
                } catch (DataIntegrityViolationException ex) {
                    System.out.println("Duplicate ORDER_CANCELLED event: " + eventId);
                }
            }
        } catch (Exception ex) {
            System.err.println("Error processing order-events: " + ex.getMessage());
            throw new RuntimeException(ex);
        }
    }
}
