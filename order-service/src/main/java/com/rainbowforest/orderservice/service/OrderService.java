package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;

import java.util.List;

public interface OrderService {
    public Order saveOrder(Order order);
    public List<Order> getAllOrders();
    public List<Order> getOrdersByUserId(Long userId);
    public Order getOrderById(Long orderId);
    public Order updateOrderStatus(Long orderId, String status, String paymentStatus);

    Order transitionOrder(Long orderId, String targetStatus, String reason, String changedBy, String changedByRole);
    Order cancelOrder(Long orderId, String reason, String changedBy);

}