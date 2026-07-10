package com.rainbowforest.inventoryservice.listener;

import com.rainbowforest.inventoryservice.domain.ProcessedEvent;
import com.rainbowforest.inventoryservice.repository.ProcessedEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InventoryEventListener {

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @KafkaListener(topics = "order-completed", groupId = "inventory-group")
    @Transactional
    public void handleOrderCompleted(String message) {
        // Mock parsing event ID from message (In real scenario, use ObjectMapper to parse EventEnvelope)
        String eventId = extractEventId(message); 
        
        try {
            ProcessedEvent processedEvent = new ProcessedEvent();
            processedEvent.setEventId(eventId);
            processedEvent.setEventType("ORDER_COMPLETED");
            processedEvent.setConsumerName("inventory-service");
            processedEvent.setStatus("COMPLETED");
            processedEventRepository.saveAndFlush(processedEvent);
            
            System.out.println("Processing ORDER_COMPLETED event: " + eventId);
            // Additional business logic here if needed
            
        } catch (DataIntegrityViolationException ex) {
            // Duplicate event, just ignore and acknowledge
            System.out.println("Event already processed: " + eventId + ". Skipping.");
        } catch (Exception ex) {
            // Other errors, will trigger Kafka Retry and eventually DLT
            System.err.println("Error processing event: " + eventId + ". Cause: " + ex.getMessage());
            throw ex;
        }
    }

    private String extractEventId(String message) {
        // A simple regex or json parse to extract eventId.
        // If not found, use hash of message to simulate.
        if (message.contains("\"eventId\"")) {
            try {
                String[] parts = message.split("\"eventId\"\\s*:\\s*\"");
                if (parts.length > 1) {
                    return parts[1].split("\"")[0];
                }
            } catch (Exception e) {}
        }
        return Integer.toHexString(message.hashCode());
    }
}
