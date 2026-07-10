package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.OrderItemIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemIssueRepository extends JpaRepository<OrderItemIssue, Long> {
    List<OrderItemIssue> findByOrderId(Long orderId);
    List<OrderItemIssue> findByOrderItemId(Long orderItemId);
}
