package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.CompensationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompensationLogRepository extends JpaRepository<CompensationLog, Long> {
    List<CompensationLog> findByOrderId(Long orderId);
    Optional<CompensationLog> findByOrderIdAndActionType(Long orderId, String actionType);
}
