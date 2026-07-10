package com.rainbowforest.recommendationservice.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class RecommendationConsumer {

    private static final Logger log = LoggerFactory.getLogger(RecommendationConsumer.class);
    private static final String REDIS_PRODUCT_SOLD_KEY = "recommendation:product:sold";

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "recommendation-group")
    public void processOrderEvent(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.path("eventType").asText();

            if ("ORDER_COMPLETED".equals(eventType)) {
                JsonNode payload = root.path("payload");
                JsonNode items = payload.path("items");
                
                if (items.isArray()) {
                    for (JsonNode item : items) {
                        Long productId = item.path("productId").asLong();
                        Long quantity = item.path("quantity").asLong();
                        
                        // Increment sold count in Redis for Top Products recommendation
                        redisTemplate.opsForZSet().incrementScore(REDIS_PRODUCT_SOLD_KEY, String.valueOf(productId), quantity);
                    }
                }
            }

        } catch (Exception ex) {
            log.error("Failed to process order event for recommendation: {}", ex.getMessage());
            throw new RuntimeException(ex);
        }
    }
}
