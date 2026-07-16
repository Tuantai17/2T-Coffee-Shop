package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rainbowforest.orderservice.repository.OrderStatusHistoryRepository;
import com.rainbowforest.orderservice.domain.OrderStatusHistory;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import org.springframework.kafka.core.KafkaTemplate;
import com.rainbowforest.orderservice.repository.OutboxEventRepository;
import com.rainbowforest.orderservice.domain.OutboxEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.orderservice.repository.CompensationLogRepository;
import com.rainbowforest.orderservice.domain.CompensationLog;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderStatusHistoryRepository historyRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompensationLogRepository compensationLogRepository;

    @Autowired
    private com.rainbowforest.orderservice.feignclient.InventoryClient inventoryClient;


    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.rainbowforest.orderservice.repository.ProductRepository productRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Override
    public Order saveOrder(Order order) {
        if (order.getItems() != null) {
            for (com.rainbowforest.orderservice.domain.Item item : order.getItems()) {
                if (item.getProduct() != null) {
                    Long productId = item.getProduct().getId();
                    if (productId != null) {
                        com.rainbowforest.orderservice.domain.Product existingProduct = productRepository.findById(productId)
                                .orElseGet(() -> {
                                    com.rainbowforest.orderservice.domain.Product fallbackProduct = item.getProduct();
                                    if (fallbackProduct.getProductName() == null || fallbackProduct.getProductName().isBlank()) {
                                        fallbackProduct.setProductName(
                                                item.getProductNameSnapshot() != null && !item.getProductNameSnapshot().isBlank()
                                                        ? item.getProductNameSnapshot()
                                                        : "Product #" + productId
                                        );
                                    }
                                    if (fallbackProduct.getPrice() == null) {
                                        fallbackProduct.setPrice(item.getUnitPrice() != null ? item.getUnitPrice() : item.getSubTotal());
                                    }
                                    if (fallbackProduct.getImageUrl() == null || fallbackProduct.getImageUrl().isBlank()) {
                                        fallbackProduct.setImageUrl(item.getImageSnapshot());
                                    }
                                    return productRepository.save(fallbackProduct);
                                });
                        item.setProduct(existingProduct);
                    } else {
                        com.rainbowforest.orderservice.domain.Product mergedProduct = productRepository.save(item.getProduct());
                        item.setProduct(mergedProduct);
                    }
                }
            }
        }
        if (order.getUser() != null) {
            com.rainbowforest.orderservice.domain.User mergedUser = entityManager.merge(order.getUser());
            order.setUser(mergedUser);
        }
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByIdDesc(userId);
    }

    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status, String paymentStatus) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            if (status != null && !status.isBlank()) {
                order.setStatus(status);
            }
            if (paymentStatus != null && !paymentStatus.isBlank()) {
                order.setPaymentStatus(paymentStatus);
            }
            return orderRepository.save(order);
        }
        return null;
    }

    @Override
    @Transactional
    public Order transitionOrder(Long orderId, String targetStatus, String reason, String changedBy, String changedByRole) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
                
        String currentStatus = order.getStatus();
        
        if (targetStatus.equals(currentStatus)) {
            return order; // No change
        }

        // Validate transition
        boolean valid = isValidTransition(currentStatus, targetStatus);
        if (!valid) {
            throw new IllegalArgumentException("Invalid state transition from " + currentStatus + " to " + targetStatus);
        }

        order.setStatus(targetStatus);
        
        // Update timestamps & reasons
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        switch (targetStatus) {
            case "CONFIRMED": order.setConfirmedAt(now); break;
            case "PROCESSING": order.setProcessingAt(now); break;
            case "SHIPPING": order.setShippingAt(now); break;
            case "DELIVERED": order.setDeliveredAt(now); break;
            case "DELIVERY_FAILED": 
                order.setDeliveryFailedAt(now); 
                order.setFailureReason(reason);
                break;
            case "COMPLETED": 
                order.setCompletedAt(now); 
                if ("COD".equalsIgnoreCase(order.getPaymentMethod()) && !"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
                    order.setPaymentStatus("PAID");
                }
                break;
            case "CANCELLED": 
                order.setCancelledAt(now); 
                order.setCancelReason(reason);
                break;
            case "REFUND_PENDING": order.setRefundRequestedAt(now); break;
            case "REFUNDED": order.setRefundCompletedAt(now); break;
        }

        orderRepository.save(order);

        // Save history
        OrderStatusHistory history = new OrderStatusHistory(
            orderId, currentStatus, targetStatus, reason, changedBy, changedByRole, UUID.randomUUID().toString()
        );
        historyRepository.save(history);

        // Side Effects
        triggerSideEffects(order, currentStatus, targetStatus);

        return order;
    }
    
    @Override
    @Transactional
    public Order cancelOrder(Long orderId, String reason, String changedBy) {
        // User cancellation logic. Can only cancel PENDING.
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
                
        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalArgumentException("User can only cancel PENDING orders");
        }
        
        return transitionOrder(orderId, "CANCELLED", reason, changedBy, "USER");
    }

    private boolean isValidTransition(String from, String to) {
        if (from == null) from = "PENDING";
        
        switch (from) {
            case "PENDING": return "CONFIRMED".equals(to) || "CANCELLED".equals(to);
            case "CONFIRMED": return "PROCESSING".equals(to) || "CANCELLED".equals(to);
            case "PROCESSING": return "SHIPPING".equals(to) || "CANCELLED".equals(to);
            case "SHIPPING": return "DELIVERED".equals(to) || "DELIVERY_FAILED".equals(to);
            case "DELIVERY_FAILED": return "SHIPPING".equals(to) || "RETURNING".equals(to);
            case "RETURNING": return "RETURNED_TO_WAREHOUSE".equals(to);
            case "DELIVERED": return "COMPLETED".equals(to);
            case "COMPLETED": return "REFUND_PENDING".equals(to);
            case "REFUND_PENDING": return "REFUNDED".equals(to) || "REFUND_FAILED".equals(to);
            default: return false;
        }
    }

    private void triggerSideEffects(Order order, String from, String to) {
        try {
            if ("CONFIRMED".equals(to)) {
                inventoryClient.commitReservation(order.getId());
            } else if ("CANCELLED".equals(to) || "DELIVERY_FAILED".equals(to)) {
                publishOrderCancelledEvent(order, from, order.getCancelReason());
                org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronizationAdapter() {
                        @Override
                        public void afterCommit() {
                            try {
                                inventoryClient.releaseReservation(order.getId());
                            } catch (Exception e) {
                                System.err.println("Inventory release failed for order " + order.getId());
                            }
                        }
                    }
                );
            } else if ("COMPLETED".equals(to)) {
                publishOrderEvent(order, "ORDER_COMPLETED");
            } else if ("REFUNDED".equals(to)) {
                publishOrderEvent(order, "ORDER_REFUNDED");
            }
        } catch (Exception e) {
            System.err.println("Failed side effect: " + e.getMessage());
        }
    }

    private void publishOrderCancelledEvent(Order order, String previousStatus, String reason) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("orderId", order.getId());
            event.put("orderCode", "MKD" + String.format("%08d", order.getId()));
            event.put("userId", order.getUser() != null ? order.getUser().getId() : null);
            event.put("previousStatus", previousStatus);
            event.put("newStatus", "CANCELLED");
            event.put("reason", reason);
            event.put("cancelledAt", order.getCancelledAt() != null ? order.getCancelledAt().toString() : java.time.LocalDateTime.now().toString());
            event.put("email", order.getEmail());
            event.put("recipientEmail", order.getEmail());
            event.put("recipientName", order.getReceiverName() != null ? order.getReceiverName() : "Customer");
            
            com.rainbowforest.orderservice.domain.EventEnvelope envelope = new com.rainbowforest.orderservice.domain.EventEnvelope(
                java.util.UUID.randomUUID().toString(), "ORDER_CANCELLED", 1, java.util.UUID.randomUUID().toString(), "order-service", event
            );
            String payloadJson = objectMapper.writeValueAsString(envelope);
            OutboxEvent outbox = new OutboxEvent(order.getId().toString(), "ORDER_CANCELLED", payloadJson);
            outbox.setEventId(java.util.UUID.randomUUID());
            outbox.setBusinessKey("ORDER_CANCELLED:" + order.getId());
            outboxEventRepository.save(outbox);
        } catch (Exception ex) {
            System.err.println("Failed to save outbox event: " + ex.getMessage());
        }
    }

    private void publishOrderEvent(Order order, String eventType) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("orderId", order.getId());
            event.put("orderCode", "MKD" + String.format("%08d", order.getId()));
            event.put("userId", order.getUser() != null ? order.getUser().getId() : null);
            event.put("total", order.getTotal());
            event.put("productSubtotal", order.getTotal());
            event.put("status", order.getStatus());
            event.put("email", order.getEmail());
            event.put("recipientEmail", order.getEmail());
            event.put("recipientName", order.getReceiverName() != null ? order.getReceiverName() : "Customer");
            
            java.util.List<Map<String, Object>> itemsList = new java.util.ArrayList<>();
            if (order.getItems() != null) {
                for (com.rainbowforest.orderservice.domain.Item item : order.getItems()) {
                    Map<String, Object> itemData = new HashMap<>();
                    itemData.put("productId", item.getProduct() != null ? item.getProduct().getId() : null);
                    itemData.put("quantity", item.getQuantity());
                    itemsList.add(itemData);
                }
            }
            event.put("items", itemsList);
            
            com.rainbowforest.orderservice.domain.EventEnvelope envelope = new com.rainbowforest.orderservice.domain.EventEnvelope(
                java.util.UUID.randomUUID().toString(), eventType, 1, java.util.UUID.randomUUID().toString(), "order-service", event
            );
            String payloadJson = objectMapper.writeValueAsString(envelope);
            OutboxEvent outbox = new OutboxEvent(order.getId().toString(), eventType, payloadJson);
            outboxEventRepository.save(outbox);
        } catch (Exception ex) {
            System.err.println("Failed to save outbox event: " + ex.getMessage());
        }
    }

}
