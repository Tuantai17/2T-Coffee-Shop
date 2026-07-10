package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.OrderActivityLog;
import com.rainbowforest.orderservice.domain.OrderItemIssue;
import com.rainbowforest.orderservice.service.AdminOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/orders")
public class AdminOrderController {

    @Autowired
    private AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<com.rainbowforest.orderservice.dto.OrderPageResponseDto> getAdminOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "newest") String sort) {
        
        com.rainbowforest.orderservice.dto.OrderPageResponseDto response = adminOrderService.getAdminOrders(
                page, size, keyword, status, paymentMethod, fromDate, toDate, sort);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<com.rainbowforest.orderservice.dto.OrderAdminDetailDto> getOrderDetails(@PathVariable Long orderId) {
        com.rainbowforest.orderservice.dto.OrderAdminDetailDto dto = adminOrderService.getAdminOrderDetailDto(orderId);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        String performedBy = payload.getOrDefault("performedBy", "admin");
        Order order = adminOrderService.updateOrderStatus(orderId, newStatus, performedBy);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/details")
    public ResponseEntity<Order> updateOrderDetails(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> payload) {
        String performedBy = payload.getOrDefault("performedBy", "admin");
        Order order = adminOrderService.updateOrderDetails(orderId, payload, performedBy);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/items/{itemId}/issues")
    public ResponseEntity<OrderItemIssue> reportItemIssue(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> issueData) {
        String performedBy = (String) issueData.getOrDefault("performedBy", "admin");
        OrderItemIssue issue = adminOrderService.reportItemIssue(orderId, itemId, issueData, performedBy);
        return ResponseEntity.ok(issue);
    }

    @GetMapping("/{orderId}/issues/{issueId}/resolution-preview")
    public ResponseEntity<Map<String, Object>> getResolutionPreview(
            @PathVariable Long orderId,
            @PathVariable Long issueId,
            @RequestParam Map<String, Object> resolutionData) {
        Map<String, Object> preview = adminOrderService.getResolutionPreview(orderId, issueId, resolutionData);
        return ResponseEntity.ok(preview);
    }

    @PostMapping("/{orderId}/issues/{issueId}/resolve")
    public ResponseEntity<Order> resolveItemIssue(
            @PathVariable Long orderId,
            @PathVariable Long issueId,
            @RequestBody Map<String, Object> resolutionData) {
        String performedBy = (String) resolutionData.getOrDefault("performedBy", "admin");
        Order order = adminOrderService.resolveItemIssue(orderId, issueId, resolutionData, performedBy);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}/contact-logs")
    public ResponseEntity<List<com.rainbowforest.orderservice.domain.OrderContactLog>> getContactLogs(@PathVariable Long orderId) {
        return ResponseEntity.ok(adminOrderService.getContactLogs(orderId));
    }

    @PostMapping("/{orderId}/contact-logs")
    public ResponseEntity<Void> logContact(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> contactData) {
        String performedBy = (String) contactData.getOrDefault("performedBy", "admin");
        adminOrderService.logContact(orderId, contactData, performedBy);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{orderId}/restock-info")
    public ResponseEntity<Void> updateRestockInfo(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> data) {
        String dateStr = (String) data.get("expectedRestockDate");
        java.time.LocalDate date = dateStr != null && !dateStr.isEmpty() ? java.time.LocalDate.parse(dateStr) : null;
        String note = (String) data.get("note");
        String performedBy = (String) data.getOrDefault("performedBy", "admin");
        adminOrderService.updateRestockInfo(orderId, date, note, performedBy);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/resume-after-restock")
    public ResponseEntity<Void> resumeAfterRestock(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> data) {
        String performedBy = (String) data.getOrDefault("performedBy", "admin");
        adminOrderService.resumeAfterRestock(orderId, performedBy);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> data) {
        String reason = (String) data.get("reason");
        String performedBy = (String) data.getOrDefault("performedBy", "admin");
        adminOrderService.cancelOrder(orderId, reason, performedBy);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{orderId}/history")
    public ResponseEntity<List<OrderActivityLog>> getOrderHistory(@PathVariable Long orderId) {
        return ResponseEntity.ok(adminOrderService.getOrderActivityLogs(orderId));
    }

    @GetMapping("/{orderId}/issues")
    public ResponseEntity<List<OrderItemIssue>> getOrderIssues(@PathVariable Long orderId) {
        return ResponseEntity.ok(adminOrderService.getOrderIssues(orderId));
    }
}
