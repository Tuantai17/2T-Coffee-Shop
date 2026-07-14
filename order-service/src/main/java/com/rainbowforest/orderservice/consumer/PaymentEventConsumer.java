package com.rainbowforest.orderservice.consumer;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.repository.OrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventConsumer.class);

    @Autowired
    private OrderRepository orderRepository;

    @KafkaListener(topics = "payment-events", groupId = "order-group")
    @Transactional
    public void consumePaymentEvent(JsonNode paymentEvent) {
        log.info("ORDER SERVICE: Received event from payment-events topic");
        if (paymentEvent == null || paymentEvent.isNull()) return;

        JsonNode orderIdNode = paymentEvent.get("orderId");
        JsonNode statusNode = paymentEvent.get("status");
        JsonNode paymentMethodNode = paymentEvent.get("paymentMethod");

        if (orderIdNode != null && !orderIdNode.isNull() && statusNode != null && !statusNode.isNull()) {
            Long orderId = orderIdNode.asLong();
            String status = statusNode.asText();
            String paymentMethod = paymentMethodNode != null && !paymentMethodNode.isNull()
                    ? paymentMethodNode.asText()
                    : null;
            
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                // If the payment is refunded, update the order's payment status
                if ("REFUNDED".equals(status)) {
                    if ("REFUND_PENDING".equals(order.getPaymentStatus()) || "PAID".equals(order.getPaymentStatus())) {
                        order.setPaymentStatus("REFUNDED");
                        order.setRefundCompletedAt(java.time.LocalDateTime.now());
                        orderRepository.save(order);
                        log.info("ORDER SERVICE: Order {} payment status updated to REFUNDED", orderId);
                    }
                } else if ("SUCCESS".equals(status)) {
                    if ("PENDING".equals(order.getPaymentStatus())) {
                        order.setPaymentStatus("PAID");
                        if ("VNPAY".equalsIgnoreCase(paymentMethod)
                                && "PENDING_CONFIRMATION".equalsIgnoreCase(order.getStatus())) {
                            order.setStatus("CONFIRMED");
                            if (order.getConfirmedAt() == null) {
                                order.setConfirmedAt(java.time.LocalDateTime.now());
                            }
                        }
                        orderRepository.save(order);
                        log.info("ORDER SERVICE: Order {} payment status updated to PAID and status synced to {}", orderId, order.getStatus());
                    }
                } else if ("FAILED".equals(status)) {
                    if ("PENDING".equals(order.getPaymentStatus())) {
                        order.setPaymentStatus("FAILED");
                        orderRepository.save(order);
                        log.info("ORDER SERVICE: Order {} payment status updated to FAILED", orderId);
                    }
                }
            } else {
                log.warn("ORDER SERVICE: Order {} not found for payment event", orderId);
            }
        }
    }
}
