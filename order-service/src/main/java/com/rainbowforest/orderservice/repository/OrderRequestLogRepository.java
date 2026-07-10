package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.OrderRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRequestLogRepository extends JpaRepository<OrderRequestLog, Long> {
    Optional<OrderRequestLog> findByIdempotencyKey(String idempotencyKey);
}
