package com.rainbowforest.orderservice.job;

import com.rainbowforest.orderservice.domain.OutboxEvent;
import com.rainbowforest.orderservice.repository.OutboxEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OutboxPublisherJob {

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 5000)
    @org.springframework.transaction.annotation.Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findPendingEventsForProcessing(java.time.LocalDateTime.now().minusMinutes(5));
        for (OutboxEvent event : pendingEvents) {
            event.setStatus("PROCESSING");
            event.setProcessingStartedAt(java.time.LocalDateTime.now());
            event.setClaimedBy("order-service-node-1");
            outboxEventRepository.save(event);
            outboxEventRepository.flush();
            try {
                event.setLastAttemptAt(java.time.LocalDateTime.now());
                String topic = "ORDER_COMPLETED".equals(event.getEventType()) ? "order-completed" : "order-events";
                kafkaTemplate.send(topic, event.getPayload()).get(5, java.util.concurrent.TimeUnit.SECONDS);
                
                event.setStatus("PUBLISHED");
                event.setPublishedAt(java.time.LocalDateTime.now());
                event.setErrorMessage(null);
                outboxEventRepository.save(event);
                System.out.println("Published Outbox event: " + event.getId());
            } catch (Exception e) {
                System.err.println("Failed to publish event " + event.getId() + ": " + e.getMessage());
                event.setRetryCount(event.getRetryCount() + 1);
                event.setErrorMessage(e.getMessage() != null ? e.getMessage() : e.toString());
                
                if (event.getRetryCount() >= 5) {
                    event.setStatus("FAILED");
                    event.setNextRetryAt(null);
                } else {
                    event.setStatus("PENDING");
                    // Exponential backoff: next_retry = now + 2^retryCount * 5 seconds
                    long backoffSeconds = (long) Math.pow(2, event.getRetryCount()) * 5;
                    event.setNextRetryAt(java.time.LocalDateTime.now().plusSeconds(backoffSeconds));
                }
                outboxEventRepository.save(event);
            }
        }
    }
}
