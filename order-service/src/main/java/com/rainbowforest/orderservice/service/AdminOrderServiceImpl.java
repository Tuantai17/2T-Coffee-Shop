package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.*;
import com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.repository.ItemRepository;
import com.rainbowforest.orderservice.repository.OrderActivityLogRepository;
import com.rainbowforest.orderservice.repository.OrderContactLogRepository;
import com.rainbowforest.orderservice.repository.OrderRepository;
import com.rainbowforest.orderservice.repository.OrderItemIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminOrderServiceImpl implements AdminOrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private OrderActivityLogRepository activityLogRepository;
    
    @Autowired
    private OrderContactLogRepository contactLogRepository;

    @Autowired
    private OrderItemIssueRepository issueRepository;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private com.rainbowforest.orderservice.feignclient.UserClient userClient;

    @Autowired
    private com.rainbowforest.orderservice.repository.OutboxEventRepository outboxEventRepository;

    @Autowired
    private com.rainbowforest.orderservice.repository.RefundRepository refundRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Override
    public Order getOrderDetails(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus, String performedBy) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        String oldStatus = order.getStatus();
        
        // Luồng kiểm tra cơ bản
        if ("COMPLETED".equals(oldStatus) && !"CANCELLED".equals(newStatus)) {
            throw new RuntimeException("Không thể chuyển trạng thái từ Hoàn thành");
        }
        
        // Nếu chuyển sang Đang giao, kiểm tra xem có sự cố nào chưa giải quyết không
        if ("SHIPPING".equals(newStatus)) {
            List<OrderItemIssue> issues = issueRepository.findByOrderId(orderId);
            boolean hasOpenIssue = issues.stream().anyMatch(i -> "OPEN".equals(i.getIssueStatus()));
            if (hasOpenIssue) {
                throw new RuntimeException("Không thể giao hàng khi có sự cố sản phẩm chưa xử lý");
            }
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        logActivity(orderId, "STATUS_CHANGE", "Cập nhật trạng thái đơn hàng", oldStatus, newStatus, performedBy);
        
        return savedOrder;
    }

    @Override
    @Transactional
    public Order updateOrderDetails(Long orderId, Map<String, String> payload, String performedBy) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (payload.containsKey("receiverName")) order.setReceiverName(payload.get("receiverName"));
        if (payload.containsKey("phone")) order.setPhone(payload.get("phone"));
        if (payload.containsKey("address")) order.setAddress(payload.get("address"));
        if (payload.containsKey("note")) order.setNote(payload.get("note"));
        
        Order savedOrder = orderRepository.save(order);
        logActivity(orderId, "DETAILS_UPDATE", "Cập nhật thông tin giao hàng", null, null, performedBy);
        
        return savedOrder;
    }

    @Override
    @Transactional
    public OrderItemIssue reportItemIssue(Long orderId, Long itemId, Map<String, Object> issueData, String performedBy) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!order.getItems().contains(item)) {
            throw new RuntimeException("Item does not belong to Order");
        }

        String issueType = (String) issueData.get("issueType");
        Integer fulfillable = (Integer) issueData.get("fulfillableQuantity");
        Integer damaged = (Integer) issueData.get("damagedQuantity");
        Integer missing = (Integer) issueData.get("missingQuantity");
        String reason = (String) issueData.get("reason");
        String internalNote = (String) issueData.get("internalNote");

        OrderItemIssue issue = new OrderItemIssue();
        issue.setOrderId(orderId);
        issue.setOrderItemId(itemId);
        issue.setProductId(item.getProduct().getId());
        issue.setIssueType(issueType);
        issue.setOrderedQuantity(item.getOriginalQuantity() != null ? item.getOriginalQuantity() : item.getQuantity());
        issue.setFulfillableQuantity(fulfillable);
        issue.setDamagedQuantity(damaged != null ? damaged : 0);
        issue.setMissingQuantity(missing != null ? missing : 0);
        issue.setReason(reason);
        issue.setInternalNote(internalNote);
        
        issueRepository.save(issue);

        // Update item status
        item.setItemStatus("AWAITING_CUSTOMER");
        item.setIssueReason(reason);
        item.setIssueReportedAt(LocalDateTime.now());
        item.setIssueReportedBy(performedBy);
        itemRepository.save(item);

        // Gọi inventory-service ghi nhận hàng hư/thiếu bằng idempotency key
        int issueQuantity = (damaged != null ? damaged : 0) + (missing != null ? missing : 0);
        if (issueQuantity > 0) {
            com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest req = new com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest(
                orderId, itemId, item.getProduct().getId(), issueQuantity, reason, java.util.UUID.randomUUID().toString()
            );
            try {
                productClient.reportDamagedInventory(req);
            } catch (Exception e) {
                // Nếu inventory-service lỗi, rollback hoặc báo lỗi
                throw new RuntimeException("Lỗi khi gọi inventory-service: " + e.getMessage());
            }
        }

        // Chuyển trạng thái đơn sang chờ khách phản hồi
        if (!"AWAITING_CUSTOMER_DECISION".equals(order.getStatus())) {
            updateOrderStatus(orderId, "AWAITING_CUSTOMER_DECISION", performedBy);
        }

        logActivity(orderId, "ISSUE_REPORTED", "Báo sự cố: " + issueType + " cho sản phẩm " + item.getProduct().getProductName(), null, null, performedBy);

        return issue;
    }

    @Override
    public Map<String, Object> getResolutionPreview(Long orderId, Long issueId, Map<String, Object> resolutionData) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        OrderItemIssue issue = issueRepository.findById(issueId).orElseThrow(() -> new RuntimeException("Issue not found"));
        Item item = itemRepository.findById(issue.getOrderItemId()).orElseThrow(() -> new RuntimeException("Item not found"));
        
        String decision = (String) resolutionData.get("customerDecision");
        BigDecimal oldTotal = order.getTotal();
        BigDecimal newTotal = oldTotal;
        BigDecimal difference = BigDecimal.ZERO;

        if ("ACCEPT_PARTIAL".equals(decision)) {
            Integer agreedQuantity = resolutionData.containsKey("agreedQuantity") ? 
                                     Integer.valueOf(resolutionData.get("agreedQuantity").toString()) : 0;
            BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : (item.getProduct() != null ? item.getProduct().getPrice() : BigDecimal.ZERO);
            int currentQty = item.getFinalQuantity() != null ? item.getFinalQuantity() : item.getQuantity();
            
            BigDecimal currentSubtotal = price.multiply(new BigDecimal(currentQty));
            BigDecimal newSubtotal = price.multiply(new BigDecimal(agreedQuantity));
            newTotal = oldTotal.subtract(currentSubtotal).add(newSubtotal);
            difference = newTotal.subtract(oldTotal);
        } else if ("REMOVE_ITEM".equals(decision)) {
            BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : (item.getProduct() != null ? item.getProduct().getPrice() : BigDecimal.ZERO);
            int currentQty = item.getFinalQuantity() != null ? item.getFinalQuantity() : item.getQuantity();
            BigDecimal currentSubtotal = price.multiply(new BigDecimal(currentQty));
            
            newTotal = oldTotal.subtract(currentSubtotal);
            difference = newTotal.subtract(oldTotal);
        } else if ("CANCEL_ORDER".equals(decision)) {
            newTotal = BigDecimal.ZERO;
            difference = newTotal.subtract(oldTotal);
        } // "WAIT_RESTOCK" keeps the old total

        Map<String, Object> preview = new java.util.HashMap<>();
        preview.put("oldTotal", oldTotal);
        preview.put("newTotal", newTotal);
        preview.put("difference", difference);
        return preview;
    }

    @Override
    @Transactional
    public Order resolveItemIssue(Long orderId, Long issueId, Map<String, Object> resolutionData, String performedBy) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        OrderItemIssue issue = issueRepository.findById(issueId).orElseThrow(() -> new RuntimeException("Issue not found"));
        Item item = itemRepository.findById(issue.getOrderItemId()).orElseThrow(() -> new RuntimeException("Item not found"));

        String decision = (String) resolutionData.get("customerDecision");
        String customerNote = (String) resolutionData.get("customerNote");
        String contactMethod = (String) resolutionData.get("contactMethod");

        issue.setCustomerDecision(decision);
        issue.setCustomerNote(customerNote);
        issue.setContactMethod(contactMethod);
        issue.setContactedAt(LocalDateTime.now());
        issue.setContactedBy(performedBy);
        issue.setResolvedAt(LocalDateTime.now());
        issue.setResolvedBy(performedBy);
        issue.setIssueStatus("RESOLVED");
        
        BigDecimal oldTotal = order.getTotal();
        int oldFinalQty = item.getFinalQuantity() != null ? item.getFinalQuantity() : item.getQuantity();

        if ("ACCEPT_PARTIAL".equals(decision)) {
            Integer agreedQuantity = (Integer) resolutionData.get("agreedQuantity");
            item.setFinalQuantity(agreedQuantity);
            item.setQuantity(agreedQuantity); // update old quantity for compatibility
            item.setItemStatus("QUANTITY_ADJUSTED");
            item.setSubTotal(item.getUnitPrice().multiply(new BigDecimal(agreedQuantity)));
            
            // Call product-catalog-service to adjust damaged inventory if damaged
            if (issue.getDamagedQuantity() > 0) {
                InventoryAdjustmentRequest req = new InventoryAdjustmentRequest(orderId, item.getId(), item.getProduct().getId(), issue.getDamagedQuantity(), issue.getReason(), UUID.randomUUID().toString());
                try { productClient.reportDamagedInventory(req); } catch (Exception ignored) {}
            }
            
            logActivity(orderId, "QUANTITY_ADJUSTED", "Khách đồng ý nhận " + agreedQuantity + " sản phẩm " + item.getProduct().getProductName(), String.valueOf(oldFinalQty), String.valueOf(agreedQuantity), performedBy);

        } else if ("REMOVE_ITEM".equals(decision)) {
            item.setFinalQuantity(0);
            item.setQuantity(0);
            item.setItemStatus("REMOVED");
            item.setSubTotal(BigDecimal.ZERO);
            
            // Release good items back to inventory, report damaged
            if (issue.getDamagedQuantity() > 0) {
                InventoryAdjustmentRequest req = new InventoryAdjustmentRequest(orderId, item.getId(), item.getProduct().getId(), issue.getDamagedQuantity(), issue.getReason(), UUID.randomUUID().toString());
                try { productClient.reportDamagedInventory(req); } catch (Exception ignored) {}
            }
            int goodQty = issue.getOrderedQuantity() - issue.getDamagedQuantity() - issue.getMissingQuantity();
            if (goodQty > 0) {
                 InventoryAdjustmentRequest req = new InventoryAdjustmentRequest(orderId, item.getId(), item.getProduct().getId(), goodQty, "Loại sản phẩm khỏi đơn", UUID.randomUUID().toString());
                 try { productClient.releaseInventory(req); } catch (Exception ignored) {}
            }

            logActivity(orderId, "ITEM_REMOVED", "Khách yêu cầu loại bỏ sản phẩm " + item.getProduct().getProductName(), String.valueOf(oldFinalQty), "0", performedBy);
            
        } else if ("WAIT_RESTOCK".equals(decision)) {
            item.setItemStatus("WAITING_FOR_RESTOCK");
            updateOrderStatus(orderId, "WAITING_FOR_RESTOCK", performedBy);
            logActivity(orderId, "WAIT_RESTOCK", "Khách đồng ý chờ bổ sung hàng", null, null, performedBy);
            
        } else if ("CANCEL_ORDER".equals(decision)) {
            String oldStatusResolve = order.getStatus();
            updateOrderStatus(orderId, "CANCELLED", performedBy);
            logActivity(orderId, "ORDER_CANCELLED", "Khách yêu cầu hủy toàn bộ đơn hàng do sự cố", oldStatusResolve, "CANCELLED", performedBy);
            
            // Giải phóng hàng tốt đang giữ cho toàn bộ đơn hàng
            for (Item orderItem : order.getItems()) {
                if (!"REMOVED".equals(orderItem.getItemStatus())) {
                    int qtyToRelease = orderItem.getFinalQuantity() != null ? orderItem.getFinalQuantity() : orderItem.getQuantity();
                    
                    // Nếu là item đang có sự cố, phải trừ đi số lượng hư/thiếu đã báo cáo
                    if (orderItem.getId().equals(item.getId())) {
                        qtyToRelease = issue.getOrderedQuantity() - issue.getDamagedQuantity() - issue.getMissingQuantity();
                        // Hàng hư đã được report ở reportItemIssue hoặc sẽ report ở đây nếu cần, 
                        // nhưng ở reportItemIssue ta đã gọi reportDamagedInventory rồi.
                    }
                    
                    if (qtyToRelease > 0) {
                        com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest req = new com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest(
                            orderId, orderItem.getId(), orderItem.getProduct().getId(), qtyToRelease, "Hủy đơn hàng", java.util.UUID.randomUUID().toString()
                        );
                        try { productClient.releaseInventory(req); } catch (Exception ignored) {}
                    }
                    orderItem.setItemStatus("CANCELLED");
                    orderItem.setFinalQuantity(0);
                    itemRepository.save(orderItem);
                }
            }
            
            // Nếu đã thanh toán, chuyển trạng thái REFUND_PENDING
            if ("PAID".equals(order.getPaymentStatus())) {
                order.setPaymentStatus("REFUND_PENDING");
            }
            order.setTotal(BigDecimal.ZERO);
            publishOrderCancelledEvent(order, oldStatusResolve, "Khách yêu cầu hủy toàn bộ đơn hàng do sự cố");
        }

        itemRepository.save(item);
        issueRepository.save(issue);

        // Recalculate total if not waiting
        if (!"WAIT_RESTOCK".equals(decision) && !"CANCELLED".equals(order.getStatus())) {
            recalculateOrderTotals(order);
            boolean allIssuesResolved = issueRepository.findByOrderId(orderId).stream().noneMatch(i -> "OPEN".equals(i.getIssueStatus()));
            if (allIssuesResolved && "AWAITING_CUSTOMER_DECISION".equals(order.getStatus())) {
                updateOrderStatus(orderId, "PREPARING", "SYSTEM");
            }
        }
        
        return order;
    }

    private void recalculateOrderTotals(Order order) {
        BigDecimal newSubtotal = BigDecimal.ZERO;
        for (Item item : order.getItems()) {
            if (!"REMOVED".equals(item.getItemStatus())) {
                int qty = item.getFinalQuantity() != null ? item.getFinalQuantity() : item.getQuantity();
                BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : (item.getProduct() != null ? item.getProduct().getPrice() : BigDecimal.ZERO);
                newSubtotal = newSubtotal.add(price.multiply(new BigDecimal(qty)));
            }
        }
        
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal shipping = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;
        order.setTotal(newSubtotal.subtract(discount).add(shipping));
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void logContact(Long orderId, Map<String, Object> contactData, String performedBy) {
        String method = (String) contactData.get("method");
        String subject = (String) contactData.get("subject");
        String notes = (String) contactData.get("notes");
        
        OrderContactLog contactLog = new OrderContactLog();
        contactLog.setOrderId(orderId);
        contactLog.setMethod(method);
        contactLog.setSubject(subject);
        contactLog.setNote(notes);
        contactLog.setContactedBy(performedBy);
        contactLog.setContactedAt(LocalDateTime.now());
        if ("EMAIL".equals(method)) {
            contactLog.setDeliveryStatus("PENDING"); // Could be updated via event later
        }
        contactLogRepository.save(contactLog);

        logActivity(orderId, "CONTACT_CUSTOMER", "Liên hệ khách qua " + method + (subject != null ? " - " + subject : ""), null, null, performedBy);
    }

    @Override
    public List<OrderContactLog> getContactLogs(Long orderId) {
        return contactLogRepository.findByOrderIdOrderByContactedAtDesc(orderId);
    }

    @Override
    @Transactional
    public void updateRestockInfo(Long orderId, java.time.LocalDate expectedDate, String note, String performedBy) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setExpectedRestockDate(expectedDate);
        order.setRestockNote(note);
        orderRepository.save(order);
        logActivity(orderId, "UPDATE_RESTOCK_INFO", "Cập nhật ngày dự kiến nhập hàng: " + expectedDate + (note != null ? " - " + note : ""), null, null, performedBy);
    }

    @Override
    @Transactional
    public void resumeAfterRestock(Long orderId, String performedBy) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!"WAITING_FOR_RESTOCK".equals(order.getStatus())) {
            throw new RuntimeException("Order is not in WAITING_FOR_RESTOCK state");
        }
        
        // Find items that are waiting for restock
        List<Item> items = order.getItems();
        for (Item item : items) {
            if ("WAITING_FOR_RESTOCK".equals(item.getItemStatus())) {
                // Reserve inventory via ProductClient
                try {
                    InventoryAdjustmentRequest req = new InventoryAdjustmentRequest();
                    req.setProductId(item.getProduct().getId());
                    req.setQuantity(item.getFinalQuantity() != null ? item.getFinalQuantity() : item.getQuantity());
                    req.setReason("RESUME_ORDER_RESTOCK");
                    req.setIdempotencyKey(UUID.randomUUID().toString());
                    productClient.adjustInventory(req); // Call adjust (negative to reduce stock)
                    
                    item.setItemStatus("PREPARING");
                } catch (Exception e) {
                    throw new RuntimeException("Không đủ tồn kho để bù cho sản phẩm " + item.getProduct().getProductName(), e);
                }
            }
        }
        itemRepository.saveAll(items);

        String oldStatus = order.getStatus();
        order.setStatus("PREPARING");
        order.setExpectedRestockDate(null);
        order.setRestockNote(null);
        orderRepository.save(order);

        logActivity(orderId, "STATUS_CHANGED", "Đã đủ hàng, chuyển sang Đang chuẩn bị", oldStatus, "PREPARING", performedBy);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, String reason, String performedBy) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        
        if ("CANCELLED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Cannot cancel an order that is already CANCELLED or COMPLETED");
        }

        String oldStatus = order.getStatus();
        order.setStatus("CANCELLED");
        order.setCancelReason(reason);
        order.setCancelledAt(java.time.LocalDateTime.now());
        order.setCancelledBy(performedBy);

        if ("PAID".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("REFUND_PENDING");
            // Ideally trigger payment-service refund logic here.
        }

        List<Item> items = order.getItems();
        for (Item item : items) {
            if (!"CANCELLED".equals(item.getItemStatus()) && !"REMOVED".equals(item.getItemStatus())) {
                item.setItemStatus("CANCELLED");
            }
        }
        itemRepository.saveAll(items);
        orderRepository.save(order);

        logActivity(orderId, "STATUS_CHANGED", "Đơn hàng đã bị hủy. Lý do: " + reason, oldStatus, "CANCELLED", performedBy);
        publishOrderCancelledEvent(order, oldStatus, reason);
    }

    private void publishOrderCancelledEvent(Order order, String previousStatus, String reason) {
        try {
            Map<String, Object> event = new java.util.HashMap<>();
            event.put("orderId", order.getId());
            event.put("orderCode", "ORD-" + order.getId());
            event.put("userId", order.getUser() != null ? order.getUser().getId() : null);
            event.put("previousStatus", previousStatus);
            event.put("newStatus", "CANCELLED");
            event.put("reason", reason);
            event.put("cancelledAt", order.getCancelledAt() != null ? order.getCancelledAt().toString() : java.time.LocalDateTime.now().toString());
            
            com.rainbowforest.orderservice.domain.EventEnvelope envelope = new com.rainbowforest.orderservice.domain.EventEnvelope(
                java.util.UUID.randomUUID().toString(), "ORDER_CANCELLED", 1, java.util.UUID.randomUUID().toString(), "order-service", event
            );
            String payloadJson = objectMapper.writeValueAsString(envelope);
            com.rainbowforest.orderservice.domain.OutboxEvent outbox = new com.rainbowforest.orderservice.domain.OutboxEvent(order.getId().toString(), "ORDER_CANCELLED", payloadJson);
            outbox.setEventId(java.util.UUID.randomUUID());
            outbox.setBusinessKey("ORDER_CANCELLED:" + order.getId());
            outboxEventRepository.save(outbox);
        } catch (Exception ex) {
            System.err.println("Failed to save outbox event: " + ex.getMessage());
        }
    }

    private void publishOrderEvent(Order order, String eventType) {
        try {
            Map<String, Object> event = new java.util.HashMap<>();
            event.put("orderId", order.getId());
            event.put("userId", order.getUser() != null ? order.getUser().getId() : null);
            event.put("total", order.getTotal());
            event.put("status", order.getStatus());
            
            com.rainbowforest.orderservice.domain.EventEnvelope envelope = new com.rainbowforest.orderservice.domain.EventEnvelope(
                java.util.UUID.randomUUID().toString(), eventType, 1, java.util.UUID.randomUUID().toString(), "order-service", event
            );
            String payloadJson = objectMapper.writeValueAsString(envelope);
            com.rainbowforest.orderservice.domain.OutboxEvent outbox = new com.rainbowforest.orderservice.domain.OutboxEvent(order.getId().toString(), eventType, payloadJson);
            outboxEventRepository.save(outbox);
        } catch (Exception ex) {
            System.err.println("Failed to save outbox event: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public Refund confirmRefund(Long orderId, com.rainbowforest.orderservice.dto.RefundRequestDTO refundData, String performedBy) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        
        String idempotencyKey = refundData.getIdempotencyKey();
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            throw new IllegalArgumentException("Idempotency-Key is required");
        }
        
        // Calculate hash of payload for idempotency check
        String requestHash;
        try {
            requestHash = org.springframework.util.DigestUtils.md5DigestAsHex(objectMapper.writeValueAsBytes(refundData));
        } catch (Exception e) {
            requestHash = String.valueOf(refundData.hashCode());
        }

        java.util.Optional<Refund> existingRefundOpt = refundRepository.findByIdempotencyKey(idempotencyKey);
        if (existingRefundOpt.isPresent()) {
            Refund existing = existingRefundOpt.get();
            if (requestHash.equals(existing.getRequestHash())) {
                return existing;
            } else {
                throw new IllegalStateException("409 Conflict: Idempotency Key exists but payload is different");
            }
        }
        
        String refundType = refundData.getRefundType() != null ? refundData.getRefundType() : "FULL";
        
        // Calculate remaining eligible
        Long refundedSoFar = refundRepository.findByOrderId(orderId).stream()
                .filter(r -> "COMPLETED".equals(r.getStatus()))
                .mapToLong(r -> r.getRefundAmount() != null ? r.getRefundAmount() : 0L)
                .sum();
        Long remainingEligible = order.getTotal().longValue() - refundedSoFar;
        
        Long amount = 0L;
        java.util.List<com.rainbowforest.orderservice.domain.RefundItem> refundItems = new java.util.ArrayList<>();
        
        if ("FULL".equals(refundType)) {
            amount = remainingEligible;
        } else if (refundData.getItems() != null && !refundData.getItems().isEmpty()) {
            for (com.rainbowforest.orderservice.dto.RefundItemRequestDTO itemReq : refundData.getItems()) {
                Item orderItem = order.getItems().stream().filter(i -> i.getId().equals(itemReq.getOrderItemId())).findFirst().orElseThrow(() -> new RuntimeException("Item not found"));
                if (itemReq.getQuantity() > orderItem.getQuantity()) {
                    throw new IllegalArgumentException("Refund quantity exceeds ordered quantity");
                }
                long itemRefund = orderItem.getUnitPrice().longValue() * itemReq.getQuantity();
                amount += itemRefund;
                
                com.rainbowforest.orderservice.domain.RefundItem ri = new com.rainbowforest.orderservice.domain.RefundItem();
                ri.setOrderItemId(orderItem.getId());
                ri.setProductId(orderItem.getProduct().getId());
                ri.setQuantity(itemReq.getQuantity());
                ri.setUnitRefundAmount(orderItem.getUnitPrice().longValue());
                ri.setEligibleRefundAmount(itemRefund);
                ri.setRestockRequired(true);
                refundItems.add(ri);
            }
        } else {
            throw new IllegalArgumentException("PARTIAL refund requires items");
        }
        
        if (amount > remainingEligible) {
            throw new IllegalArgumentException("Số tiền refund (" + amount + ") vượt quá số tiền hợp lệ còn lại (" + remainingEligible + ")");
        }

        String reason = refundData.getReason() != null ? refundData.getReason() : "Hoàn tiền cho khách hàng";

        Refund refund = new Refund();
        refund.setRefundCode("REF-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        refund.setIdempotencyKey(idempotencyKey);
        refund.setRequestHash(requestHash);
        refund.setOrderId(orderId);
        refund.setRefundType(refundType);
        refund.setRefundAmount(amount);
        refund.setRefundedEligibleAmount(remainingEligible);
        refund.setReason(reason);
        refund.setStatus("COMPLETED");
        refund.setCompletedAt(java.time.LocalDateTime.now());
        
        for (com.rainbowforest.orderservice.domain.RefundItem ri : refundItems) {
            ri.setRefund(refund);
        }
        refund.setRefundItems(refundItems);
        
        Refund savedRefund = refundRepository.save(refund);

        if ("FULL".equals(refundType) && remainingEligible - amount == 0) {
            order.setPaymentStatus("REFUNDED");
            order.setRefundCompletedAt(refund.getCompletedAt());
            if (!"CANCELLED".equals(order.getStatus())) {
                order.setStatus("REFUNDED");
            }
        } else {
            order.setPaymentStatus("PARTIALLY_REFUNDED");
        }
        orderRepository.save(order);
        
        logActivity(orderId, "REFUND_COMPLETED", "Đã hoàn tiền " + amount + " cho khách hàng. Lý do: " + reason, "REFUND_PENDING", order.getPaymentStatus(), performedBy);
        publishRefundCompletedEvent(order, savedRefund, remainingEligible - amount);
        
        return savedRefund;
    }

    private void publishRefundCompletedEvent(Order order, Refund refund, Long remainingEligibleAmount) {
        try {
            Map<String, Object> event = new java.util.HashMap<>();
            event.put("refundId", refund.getId());
            event.put("orderId", order.getId());
            event.put("orderCode", "ORD-" + order.getId());
            event.put("userId", order.getUser() != null ? order.getUser().getId() : null);
            event.put("refundType", refund.getRefundType());
            event.put("refundAmount", refund.getRefundAmount());
            event.put("refundedEligibleAmount", refund.getRefundedEligibleAmount());
            event.put("remainingEligibleAmount", remainingEligibleAmount);
            event.put("reason", refund.getReason());
            event.put("refundedAt", refund.getCompletedAt().toString());
            
            com.rainbowforest.orderservice.domain.EventEnvelope envelope = new com.rainbowforest.orderservice.domain.EventEnvelope(
                java.util.UUID.randomUUID().toString(), "REFUND_COMPLETED", 1, java.util.UUID.randomUUID().toString(), "order-service", event
            );
            String payloadJson = objectMapper.writeValueAsString(envelope);
            com.rainbowforest.orderservice.domain.OutboxEvent outbox = new com.rainbowforest.orderservice.domain.OutboxEvent(refund.getId().toString(), "REFUND_COMPLETED", payloadJson);
            outbox.setEventId(java.util.UUID.randomUUID());
            outbox.setBusinessKey("REFUND_COMPLETED:" + refund.getId());
            outboxEventRepository.save(outbox);
        } catch (Exception ex) {
            System.err.println("Failed to save outbox event: " + ex.getMessage());
        }
    }

    @Override
    public List<OrderActivityLog> getOrderActivityLogs(Long orderId) {
        return activityLogRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    @Override
    public List<OrderItemIssue> getOrderIssues(Long orderId) {
        return issueRepository.findByOrderId(orderId);
    }

    private void logActivity(Long orderId, String actionType, String desc, String oldVal, String newVal, String by) {
        OrderActivityLog log = new OrderActivityLog();
        log.setOrderId(orderId);
        log.setActionType(actionType);
        log.setDescription(desc);
        log.setOldValue(oldVal);
        log.setNewValue(newVal);
        log.setPerformedBy(by);
        activityLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public com.rainbowforest.orderservice.dto.OrderPageResponseDto getAdminOrders(
            int page, int size, String keyword, String status, 
            String paymentMethod, String fromDate, String toDate, String sort) {
        
        org.springframework.data.jpa.domain.Specification<Order> spec = org.springframework.data.jpa.domain.Specification
            .where(com.rainbowforest.orderservice.repository.OrderSpecification.hasKeyword(keyword))
            .and(com.rainbowforest.orderservice.repository.OrderSpecification.hasStatus(status))
            .and(com.rainbowforest.orderservice.repository.OrderSpecification.hasPaymentMethod(paymentMethod))
            .and(com.rainbowforest.orderservice.repository.OrderSpecification.betweenDates(fromDate, toDate));
            
        org.springframework.data.domain.Sort sortObj = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id");
        if ("oldest".equals(sort)) {
            sortObj = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "id");
        } else if ("totalDesc".equals(sort)) {
            sortObj = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "total");
        } else if ("totalAsc".equals(sort)) {
            sortObj = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "total");
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page - 1, size, sortObj);
        org.springframework.data.domain.Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        java.util.List<com.rainbowforest.orderservice.dto.OrderAdminListDto> content = new java.util.ArrayList<>();
        for (Order o : orderPage.getContent()) {
            com.rainbowforest.orderservice.dto.OrderAdminListDto dto = new com.rainbowforest.orderservice.dto.OrderAdminListDto();
            dto.setId(o.getId());
            dto.setReceiverName(o.getReceiverName() != null ? o.getReceiverName() : (o.getUser() != null ? o.getUser().getUserName() : ""));
            dto.setPhone(o.getPhone());
            dto.setOrderedDate(o.getOrderedDate());
            dto.setTotal(o.getTotal());
            dto.setPaymentMethod(o.getPaymentMethod());
            dto.setPaymentStatus(o.getPaymentStatus());
            dto.setStatus(o.getStatus());
            
            java.util.List<com.rainbowforest.orderservice.dto.OrderItemBriefDto> itemDtos = new java.util.ArrayList<>();
            int maxItems = Math.min(3, o.getItems().size());
            for (int i = 0; i < maxItems; i++) {
                Item item = o.getItems().get(i);
                com.rainbowforest.orderservice.dto.OrderItemBriefDto itemDto = new com.rainbowforest.orderservice.dto.OrderItemBriefDto();
                if (item.getProduct() != null) {
                    itemDto.setProductId(item.getProduct().getId());
                    itemDto.setProductName(item.getProduct().getProductName());
                    itemDto.setImageUrl(item.getProduct().getImageUrl());
                }
                itemDtos.add(itemDto);
            }
            dto.setItems(itemDtos);
            content.add(dto);
        }

        // Statistics calculation (Optimized by doing count queries)
        com.rainbowforest.orderservice.dto.OrderStatisticsDto stats = new com.rainbowforest.orderservice.dto.OrderStatisticsDto();
        stats.setTotalOrders(orderRepository.count());
        stats.setPendingConfirmation(orderRepository.count((root, query, cb) -> cb.equal(root.get("status"), "PENDING_CONFIRMATION")));
        stats.setPacking(orderRepository.count((root, query, cb) -> cb.equal(root.get("status"), "PREPARING")));
        stats.setAwaitingCustomer(orderRepository.count((root, query, cb) -> cb.equal(root.get("status"), "AWAITING_CUSTOMER_DECISION")));
        stats.setShipping(orderRepository.count((root, query, cb) -> cb.equal(root.get("status"), "SHIPPING")));
        stats.setCompleted(orderRepository.count((root, query, cb) -> cb.equal(root.get("status"), "COMPLETED")));
        stats.setCancelled(orderRepository.count((root, query, cb) -> cb.equal(root.get("status"), "CANCELLED")));

        // Optional: Sum revenue where status = COMPLETED (Native query or JPQL logic)
        BigDecimal totalRevenue = BigDecimal.ZERO;
        List<Order> completedOrders = orderRepository.findAll((root, query, cb) -> cb.equal(root.get("status"), "COMPLETED"));
        for (Order completedOrder : completedOrders) {
            if (completedOrder.getTotal() != null) totalRevenue = totalRevenue.add(completedOrder.getTotal());
        }
        stats.setTotalRevenue(totalRevenue);

        com.rainbowforest.orderservice.dto.OrderPageResponseDto response = new com.rainbowforest.orderservice.dto.OrderPageResponseDto();
        response.setContent(content);
        response.setTotalElements(orderPage.getTotalElements());
        response.setTotalPages(orderPage.getTotalPages());
        response.setCurrentPage(page);
        response.setStatistics(stats);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public com.rainbowforest.orderservice.dto.OrderAdminDetailDto getAdminOrderDetailDto(Long orderId) {
        Order o = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        com.rainbowforest.orderservice.dto.OrderAdminDetailDto dto = new com.rainbowforest.orderservice.dto.OrderAdminDetailDto();
        dto.setId(o.getId());
        dto.setOrderedDate(o.getOrderedDate());
        dto.setStatus(o.getStatus());
        dto.setReceiverName(o.getReceiverName() != null ? o.getReceiverName() : (o.getUser() != null ? o.getUser().getUserName() : ""));
        dto.setPhone(o.getPhone());
        dto.setAddress(o.getAddress());
        dto.setProvince(o.getProvince());
        dto.setDistrict(o.getDistrict());
        dto.setWard(o.getWard());
        dto.setNote(o.getNote());
        dto.setPaymentMethod(o.getPaymentMethod());
        dto.setPaymentStatus(o.getPaymentStatus());
        dto.setExpectedRestockDate(o.getExpectedRestockDate());
        dto.setRestockNote(o.getRestockNote());
        dto.setCancelReason(o.getCancelReason());
        dto.setCancelledAt(o.getCancelledAt());
        dto.setCancelledBy(o.getCancelledBy());
        dto.setVoucherCode(o.getVoucherCode());
        dto.setDiscountAmount(o.getDiscountAmount());
        dto.setShippingFee(o.getShippingFee());
        dto.setTotal(o.getTotal());

        if (o.getUser() != null) {
            dto.setUserId(o.getUser().getId());
            dto.setUserName(o.getUser().getUserName());
            
            // Lấy email từ user-service thông qua UserClient nếu đơn hàng chưa lưu email
            if (o.getEmail() != null && !o.getEmail().isEmpty()) {
                dto.setUserEmail(o.getEmail());
            } else {
                try {
                    com.rainbowforest.orderservice.domain.User fullUser = userClient.getUserById(o.getUser().getId());
                    if (fullUser != null && fullUser.getUserDetails() != null && fullUser.getUserDetails().getEmail() != null) {
                        dto.setUserEmail(fullUser.getUserDetails().getEmail());
                    } else {
                        dto.setUserEmail(o.getUser().getUserName()); 
                    }
                } catch (Exception e) {
                    dto.setUserEmail(o.getUser().getUserName());
                }
            }
        }

        java.util.List<com.rainbowforest.orderservice.dto.OrderItemDetailDto> items = new java.util.ArrayList<>();
        for (Item item : o.getItems()) {
            com.rainbowforest.orderservice.dto.OrderItemDetailDto itemDto = new com.rainbowforest.orderservice.dto.OrderItemDetailDto();
            itemDto.setId(item.getId());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setOriginalQuantity(item.getOriginalQuantity());
            itemDto.setFinalQuantity(item.getFinalQuantity());
            itemDto.setItemStatus(item.getItemStatus());
            // Need to handle price properly, using unitPrice or price
            itemDto.setUnitPrice(item.getUnitPrice()); 
            itemDto.setSubTotal(item.getSubTotal());
            if (item.getProduct() != null) {
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setProductName(item.getProduct().getProductName());
                itemDto.setImageUrl(item.getProduct().getImageUrl());
                // Fallback to product price if unitPrice is missing
                if (itemDto.getUnitPrice() == null) {
                    itemDto.setUnitPrice(item.getProduct().getPrice());
                    itemDto.setSubTotal(item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())));
                }
            }
            items.add(itemDto);
        }
        dto.setItems(items);
        return dto;
    }
}
