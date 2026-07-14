package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.dto.OrderPaymentUpdateRequest;
import com.rainbowforest.orderservice.repository.ItemRepository;
import com.rainbowforest.orderservice.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/internal/orders")
public class OrderInternalController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private com.rainbowforest.orderservice.repository.OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @GetMapping("/products/{productId}/usage")
    public ResponseEntity<Map<String, Object>> checkProductUsage(@PathVariable("productId") Long productId) {
        boolean hasOrders = itemRepository.existsByProductId(productId);
        Map<String, Object> response = new HashMap<>();
        response.put("productId", productId);
        response.put("hasOrders", hasOrders);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{orderId}/payment-details")
    public ResponseEntity<Map<String, Object>> getPaymentDetails(@PathVariable("orderId") Long orderId) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("orderId", order.getId());
                    response.put("userId", order.getUser() != null ? order.getUser().getId() : null);
                    response.put("status", order.getStatus());
                    response.put("paymentStatus", order.getPaymentStatus());
                    response.put("finalAmount", order.getTotal());
                    return new ResponseEntity<>(response, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{orderId}/payment-status")
    public ResponseEntity<Map<String, Object>> syncPaymentStatus(@PathVariable("orderId") Long orderId,
                                                                 @RequestBody OrderPaymentUpdateRequest request) {
        com.rainbowforest.orderservice.domain.Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        String previousStatus = order.getStatus();
        String previousPaymentStatus = order.getPaymentStatus();

        if (request.getPaymentStatus() != null && !request.getPaymentStatus().isBlank()) {
            order.setPaymentStatus(request.getPaymentStatus());
        }
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            order.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getOrderStatus() != null && !request.getOrderStatus().isBlank()) {
            order.setStatus(request.getOrderStatus());
            if ("CONFIRMED".equalsIgnoreCase(request.getOrderStatus()) && order.getConfirmedAt() == null) {
                order.setConfirmedAt(request.getPaidAt() != null ? request.getPaidAt() : LocalDateTime.now());
            }
        }

        order = orderRepository.save(order);

        log.info(
                "ORDER SERVICE: synced payment state. orderId={}, previousStatus={}, newStatus={}, previousPaymentStatus={}, newPaymentStatus={}, paymentMethod={}, txnRef={}, transactionId={}, bankCode={}, paidAt={}, responseCode={}, transactionStatus={}",
                orderId,
                previousStatus,
                order.getStatus(),
                previousPaymentStatus,
                request.getPaymentStatus(),
                request.getPaymentMethod(),
                request.getTxnRef(),
                request.getTransactionId(),
                request.getBankCode(),
                request.getPaidAt(),
                request.getResponseCode(),
                request.getTransactionStatus()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("status", order.getStatus());
        response.put("paymentStatus", order.getPaymentStatus());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
