package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {
    List<OutboxEvent> findByStatusOrderByCreatedAtAsc(String status);
    
    @org.springframework.data.jpa.repository.Query("SELECT e FROM OutboxEvent e WHERE e.status = 'PENDING' OR (e.status = 'PROCESSING' AND e.processingStartedAt < :fiveMinsAgo) OR (e.status = 'FAILED' AND (e.nextRetryAt IS NULL OR e.nextRetryAt <= CURRENT_TIMESTAMP) AND e.retryCount < 5) ORDER BY e.createdAt ASC LIMIT 10")
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.QueryHints({@jakarta.persistence.QueryHint(name = "jakarta.persistence.lock.timeout", value = "-2")})
    List<OutboxEvent> findPendingEventsForProcessing(@org.springframework.data.repository.query.Param("fiveMinsAgo") java.time.LocalDateTime fiveMinsAgo);
}
