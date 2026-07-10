package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    Optional<Refund> findByOrderId(Long orderId);
    Optional<Refund> findByIdempotencyKey(String idempotencyKey);
}
