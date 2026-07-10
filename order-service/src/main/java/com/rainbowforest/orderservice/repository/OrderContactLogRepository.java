package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.OrderContactLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderContactLogRepository extends JpaRepository<OrderContactLog, Long> {
    List<OrderContactLog> findByOrderIdOrderByContactedAtDesc(Long orderId);
}
