package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.OrderActivityLog;
import com.rainbowforest.orderservice.domain.OrderItemIssue;
import com.rainbowforest.orderservice.domain.Refund;
import com.rainbowforest.orderservice.dto.RefundRequestDTO;

import java.util.List;
import java.util.Map;

public interface AdminOrderService {
    Order getOrderDetails(Long orderId);
    
    Order updateOrderStatus(Long orderId, String newStatus, String performedBy);
    
    Order updateOrderDetails(Long orderId, Map<String, String> payload, String performedBy);
    
    OrderItemIssue reportItemIssue(Long orderId, Long itemId, Map<String, Object> issueData, String performedBy);
    
    Order resolveItemIssue(Long orderId, Long issueId, Map<String, Object> resolutionData, String performedBy);
    
    Map<String, Object> getResolutionPreview(Long orderId, Long issueId, Map<String, Object> resolutionData);
    
    void logContact(Long orderId, Map<String, Object> contactData, String performedBy);
    
    List<OrderActivityLog> getOrderActivityLogs(Long orderId);
    
    List<com.rainbowforest.orderservice.domain.OrderContactLog> getContactLogs(Long orderId);
    
    void updateRestockInfo(Long orderId, java.time.LocalDate expectedDate, String note, String performedBy);
    
    void resumeAfterRestock(Long orderId, String performedBy);
    
    void cancelOrder(Long orderId, String reason, String performedBy);
    
    List<OrderItemIssue> getOrderIssues(Long orderId);
    
    com.rainbowforest.orderservice.dto.OrderPageResponseDto getAdminOrders(
            int page, int size, String keyword, String status, 
            String paymentMethod, String fromDate, String toDate, String sort);

    com.rainbowforest.orderservice.dto.OrderAdminDetailDto getAdminOrderDetailDto(Long orderId);
    
    com.rainbowforest.orderservice.domain.Refund confirmRefund(Long orderId, RefundRequestDTO refundData, String performedBy);
}
