package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Refund;
import com.rainbowforest.orderservice.dto.RefundRequestDTO;
import com.rainbowforest.orderservice.service.AdminOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/refunds")
public class AdminRefundController {

    @Autowired
    private AdminOrderService adminOrderService;

    @PostMapping("/orders/{orderId}/confirm")
    public ResponseEntity<?> confirmRefund(@PathVariable Long orderId, 
                                           @RequestBody RefundRequestDTO refundData,
                                           @RequestHeader(value = "X-User-Id", defaultValue = "system") String performedBy) {
        try {
            Refund refund = adminOrderService.confirmRefund(orderId, refundData, performedBy);
            return ResponseEntity.ok(refund);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
