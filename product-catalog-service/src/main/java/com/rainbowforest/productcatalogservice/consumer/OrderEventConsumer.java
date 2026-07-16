package com.rainbowforest.productcatalogservice.consumer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
public class OrderEventConsumer {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = {"order-completed", "order-events"}, groupId = "product-catalog-group")
    @Transactional
    public void consumeOrderEvent(String message) {
        try {
            if (message != null && message.startsWith("\"") && message.endsWith("\"")) {
                message = objectMapper.readValue(message, String.class);
            }
            Map<String, Object> eventEnvelope = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            String eventType = (String) eventEnvelope.get("eventType");

            if ("ORDER_COMPLETED".equals(eventType)) {
                Map<String, Object> payload = (Map<String, Object>) eventEnvelope.get("payload");
                if (payload != null && payload.containsKey("items")) {
                    List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
                    for (Map<String, Object> item : items) {
                        if (item.get("productId") != null && item.get("quantity") != null) {
                            Long productId = ((Number) item.get("productId")).longValue();
                            int quantity = ((Number) item.get("quantity")).intValue();
                            productRepository.incrementSoldCount(productId, quantity);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing order-events: " + e.getMessage());
        }
    }
}
