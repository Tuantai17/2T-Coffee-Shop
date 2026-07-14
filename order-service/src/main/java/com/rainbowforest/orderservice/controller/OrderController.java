package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.dto.CheckoutRequest;
import com.rainbowforest.orderservice.dto.OrderTransitionRequest;
import com.rainbowforest.orderservice.dto.OrderCancelRequest;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import com.rainbowforest.orderservice.repository.OutboxEventRepository;
import com.rainbowforest.orderservice.domain.OutboxEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.orderservice.repository.CompensationLogRepository;
import com.rainbowforest.orderservice.domain.CompensationLog;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.rainbowforest.orderservice.domain.OrderRequestLog;
import com.rainbowforest.orderservice.repository.OrderRequestLogRepository;
import com.rainbowforest.orderservice.domain.Product;
import java.util.Optional;


import jakarta.servlet.http.HttpServletRequest;

@RestController
public class OrderController {

    @Autowired
    private OrderRequestLogRepository requestLogRepository;

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompensationLogRepository compensationLogRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.rainbowforest.orderservice.feignclient.ProductClient productClient;

    @Autowired
    private com.rainbowforest.orderservice.feignclient.InventoryClient inventoryClient;

    @Autowired
    private com.rainbowforest.orderservice.feignclient.LoyaltyClient loyaltyClient;

    @PostMapping(value = "/order/checkout-preview")
    public ResponseEntity<Map<String, Object>> checkoutPreview(
            @RequestHeader(value = "Cart-Id") String cartId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody(required = false) CheckoutRequest checkoutRequest) {
        
        List<com.rainbowforest.orderservice.dto.CartItemDto> cart = cartService.getAllItemsFromCart(cartId);
        if (cart == null || cart.isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "Cart is empty");
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        for (com.rainbowforest.orderservice.dto.CartItemDto item : cart) {
            subTotal = subTotal.add(item.getSubTotal());
        }

        BigDecimal discountAmount = resolveVoucherDiscount(userIdHeader, checkoutRequest == null ? null : checkoutRequest.getVoucherCode(), subTotal);
        BigDecimal shippingFee = OrderUtilities.resolveShippingFee(subTotal);
        BigDecimal total = subTotal.subtract(discountAmount).add(shippingFee);

        Map<String, Object> preview = new HashMap<>();
        preview.put("subTotal", subTotal);
        preview.put("discountAmount", discountAmount);
        preview.put("shippingFee", shippingFee);
        preview.put("total", total);
        preview.put("items", cart);

        return new ResponseEntity<>(preview, HttpStatus.OK);
    }

    @PostMapping(value = "/order/{userId}")
    public ResponseEntity saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestHeader(value = "Cart-Id") String cartId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) CheckoutRequest checkoutRequest,
    		HttpServletRequest request){
    	
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            Optional<OrderRequestLog> existingLog = requestLogRepository.findByIdempotencyKey(idempotencyKey);
            if (existingLog.isPresent()) {
                OrderRequestLog log = existingLog.get();
                if ("COMPLETED".equals(log.getStatus())) {
                    Order existingOrder = orderService.getOrderById(log.getOrderId());
                    return new ResponseEntity<>(existingOrder, headerGenerator.getHeadersForSuccessPostMethod(request, existingOrder.getId()), HttpStatus.OK);
                } else if ("PENDING".equals(log.getStatus())) {
                    Map<String, String> err = new HashMap<>();
                    err.put("message", "Request is being processed.");
                    return new ResponseEntity<>(err, HttpStatus.CONFLICT);
                }
            } else {
                requestLogRepository.save(new OrderRequestLog(idempotencyKey, userId, "PENDING"));
            }
        }

        List<com.rainbowforest.orderservice.dto.CartItemDto> cart = cartService.getAllItemsFromCart(cartId);
        User user = userClient.getUserById(userId);   
        if(cart != null && !cart.isEmpty() && user != null) {
            Order order = null;
            
            List<Item> orderItems = new java.util.ArrayList<>();
            for (com.rainbowforest.orderservice.dto.CartItemDto dto : cart) {
                Item item = new Item();
                item.setQuantity(dto.getQuantity());
                item.setOriginalQuantity(dto.getQuantity());
                item.setFinalQuantity(dto.getQuantity());
                item.setItemStatus("NORMAL");
                item.setUnitPrice(dto.getUnitPrice());
                item.setSubTotal(dto.getSubTotal());
                
                // Add Product reference
                Product p = new Product();
                p.setId(dto.getProductId());
                item.setProduct(p);
                
                item.setProductNameSnapshot(dto.getProductName());
                item.setImageSnapshot(dto.getProductImageUrl());
                item.setVariantName(dto.getVariantName());
                item.setOptionsSnapshot(dto.getOptionsSnapshot());
                item.setToppingsSnapshot(dto.getToppingsSnapshot());
                item.setNote(dto.getNote());
                
                orderItems.add(item);
            }
        	try{
                BigDecimal subTotal = OrderUtilities.countTotalPrice(orderItems);
                BigDecimal discountAmount = resolveVoucherDiscount(String.valueOf(userId), checkoutRequest == null ? null : checkoutRequest.getVoucherCode(), subTotal);
        	    order = this.createOrder(orderItems, user, checkoutRequest, discountAmount);
                order = orderService.saveOrder(order);
                Long reservedOrderId = order.getId();
                List<com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest> requests = cart.stream()
                        .map(item -> new com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest(
                                reservedOrderId,
                                null,
                                item.getProductId(),
                                item.getVariantId(),
                                item.getQuantity(),
                                "Order checkout",
                                null
                        ))
                        .collect(java.util.stream.Collectors.toList());
                inventoryClient.reserveInventory(requests);

                consumeVoucherIfPresent(userId, checkoutRequest == null ? null : checkoutRequest.getVoucherCode(), order.getId());
                cartService.deleteCart(cartId);
                
                if (idempotencyKey != null) {
                    markLogStatus(idempotencyKey, "COMPLETED", order.getId());
                }

                try {
                    Map<String, Object> orderEvent = new HashMap<>();
                    orderEvent.put("orderId", order.getId());
                    orderEvent.put("userId", userId);
                    orderEvent.put("total", order.getTotal());
                    orderEvent.put("status", order.getStatus());
                    orderEvent.put("paymentStatus", order.getPaymentStatus());
                    orderEvent.put("email", order.getEmail());
                    orderEvent.put("recipientName", order.getReceiverName() != null ? order.getReceiverName() : "Customer");
                    orderEvent.put("orderCode", "MKD" + String.format("%08d", order.getId()));
                    
                    com.rainbowforest.orderservice.domain.EventEnvelope envelope = new com.rainbowforest.orderservice.domain.EventEnvelope(
                        java.util.UUID.randomUUID().toString(), "ORDER_CREATED", 1, java.util.UUID.randomUUID().toString(), "order-service", orderEvent
                    );
                    String payloadJson = objectMapper.writeValueAsString(envelope);
                    OutboxEvent outbox = new OutboxEvent(order.getId().toString(), "ORDER_CREATED", payloadJson);
                    outboxEventRepository.save(outbox);
    
                } catch (Exception ke) {
                    System.err.println("Lỗi gửi Kafka event: " + ke.getMessage());
                }

                return new ResponseEntity<>(
                		order, 
                		headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                		HttpStatus.CREATED);
            }catch (feign.FeignException.BadRequest ex) {
                rollbackOrderIfCreated(order);
                if (idempotencyKey != null) markLogStatus(idempotencyKey, "FAILED", null);
                ex.printStackTrace();
                String msg = ex.contentUTF8();
                String errorMsg = "Không đủ số lượng tồn kho.";
                if (msg != null && msg.contains("\"message\"")) {
                    try {
                        String[] parts = msg.split("\"message\":\"");
                        if (parts.length > 1) {
                            errorMsg = parts[1].split("\"")[0];
                        }
                    } catch (Exception e) {}
                }
                java.util.Map<String, String> errorMap = new java.util.HashMap<>();
                errorMap.put("message", errorMsg);
                return new ResponseEntity<>(errorMap, HttpStatus.BAD_REQUEST);
            }catch (feign.FeignException ex) {
                rollbackOrderIfCreated(order);
                if (idempotencyKey != null) markLogStatus(idempotencyKey, "FAILED", null);
                ex.printStackTrace();
                java.util.Map<String, String> errorMap = new java.util.HashMap<>();
                String errorMsg = extractFeignMessage(ex, null);
                if (errorMsg == null || errorMsg.isBlank()) {
                    errorMsg = ex.getMessage() != null && ex.getMessage().contains("Read timed out")
                            ? "He thong kho phan hoi qua cham. Vui long thu lai."
                            : "Loi tu he thong kho: " + ex.getMessage();
                }
                errorMap.put("message", errorMsg);
                return new ResponseEntity<>(errorMap, HttpStatus.BAD_REQUEST);
            }catch (Exception ex){
                rollbackOrderIfCreated(order);
                if (idempotencyKey != null) markLogStatus(idempotencyKey, "FAILED", null);
                ex.printStackTrace();
                java.util.Map<String, String> errorMap = new java.util.HashMap<>();
                errorMap.put("message", ex.getMessage() != null ? ex.getMessage() : ex.toString());
                return new ResponseEntity<>(errorMap, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
  
        if (idempotencyKey != null) markLogStatus(idempotencyKey, "FAILED", null);
        return new ResponseEntity<>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
    
    private void markLogStatus(String idempotencyKey, String status, Long orderId) {
        Optional<OrderRequestLog> logOpt = requestLogRepository.findByIdempotencyKey(idempotencyKey);
        if (logOpt.isPresent()) {
            OrderRequestLog log = logOpt.get();
            log.setStatus(status);
            if (orderId != null) log.setOrderId(orderId);
            log.setUpdatedAt(java.time.LocalDateTime.now());
            requestLogRepository.save(log);
        }
    }
    
    @GetMapping(value = "/order")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return new ResponseEntity<List<Order>>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @GetMapping(value = "/order/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable("userId") Long userId, HttpServletRequest request) {
        String reqUserIdStr = request.getHeader("X-User-Id");
        String role = request.getHeader("X-User-Role");
        if (role == null || (!role.contains("ADMIN") && (reqUserIdStr == null || !reqUserIdStr.equals(String.valueOf(userId))))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return new ResponseEntity<List<Order>>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @GetMapping(value = "/order/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable("orderId") Long orderId, HttpServletRequest request) {
        Order order = orderService.getOrderById(orderId);
        if (order != null) {
            String reqUserIdStr = request.getHeader("X-User-Id");
            String role = request.getHeader("X-User-Role");
            if (role == null || (!role.contains("ADMIN") && (reqUserIdStr == null || !reqUserIdStr.equals(String.valueOf(order.getUser().getId()))))) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            return new ResponseEntity<Order>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        }
        return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    @PutMapping(value = "/order/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable("orderId") Long orderId, @RequestBody Map<String, String> statusMap, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        String status = statusMap.get("status");
        String paymentStatus = statusMap.get("paymentStatus");
        Order order = orderService.updateOrderStatus(orderId, status, paymentStatus);
        if (order != null) {
            if ("CONFIRMED".equals(status)) {
                try {
                    inventoryClient.commitReservation(orderId);
                } catch (Exception e) {
                    System.err.println("Failed to commit inventory: " + e.getMessage());
                }
            } else if ("CANCELLED".equals(status) || "DELIVERY_FAILED".equals(status)) {
                try {
                    inventoryClient.releaseReservation(orderId);
                } catch (Exception e) {
                    System.err.println("Failed to release inventory: " + e.getMessage());
                }
            }
        }
        if (order != null) {
        }
        if (order != null) {
            return new ResponseEntity<Order>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        }
        return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    private Order createOrder(List<Item> cart, User user, CheckoutRequest checkoutRequest, BigDecimal discountAmount) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        BigDecimal subTotal = OrderUtilities.countTotalPrice(cart);
        BigDecimal shippingFee = OrderUtilities.resolveShippingFee(subTotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setTotal(subTotal.subtract(discountAmount).add(shippingFee));
        order.setOrderedDate(java.time.LocalDateTime.now());
        order.setStatus("PENDING_CONFIRMATION");
        order.setPaymentStatus(resolvePaymentStatus(checkoutRequest == null ? null : checkoutRequest.getPaymentMethod()));

        if (checkoutRequest != null) {
            order.setReceiverName(checkoutRequest.getReceiverName());
            order.setPhone(checkoutRequest.getPhone());
            order.setAddress(checkoutRequest.getAddress());
            order.setProvince(checkoutRequest.getProvince());
            order.setDistrict(checkoutRequest.getDistrict());
            order.setWard(checkoutRequest.getWard());
            order.setNote(checkoutRequest.getNote());
            order.setPaymentMethod(checkoutRequest.getPaymentMethod());
            order.setVoucherCode(checkoutRequest.getVoucherCode());
            order.setEmail(checkoutRequest.getEmail());
            order.setFulfillmentType(checkoutRequest.getFulfillmentType());
        }
        return order;
    }

    private BigDecimal resolveVoucherDiscount(String userIdHeader, String voucherCode, BigDecimal subTotal) {
        if (voucherCode == null || voucherCode.isBlank() || subTotal == null) {
            return BigDecimal.ZERO;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            if (userIdHeader != null && !userIdHeader.isBlank()) {
                payload.put("userId", userIdHeader);
            }
            payload.put("voucherCode", voucherCode);
            payload.put("orderTotal", subTotal.longValue());
            Map<String, Object> preview = loyaltyClient.previewVoucher(payload);
            Object discountValue = preview.get("discountAmount");
            if (discountValue instanceof Number number) {
                return BigDecimal.valueOf(number.longValue());
            }
            if (discountValue instanceof String text && !text.isBlank()) {
                return BigDecimal.valueOf(Long.parseLong(text));
            }
        } catch (feign.FeignException.BadRequest exception) {
            throw new RuntimeException(extractFeignMessage(exception, "Voucher khong hop le"));
        } catch (Exception exception) {
            throw new RuntimeException("Khong the kiem tra voucher luc nay");
        }

        return BigDecimal.ZERO;
    }

    private void consumeVoucherIfPresent(Long userId, String voucherCode, Long orderId) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return;
        }
        try {
            loyaltyClient.consumeVoucher(Map.of(
                    "userId", userId,
                    "voucherCode", voucherCode,
                    "orderId", orderId
            ));
        } catch (Exception exception) {
            System.err.println("Voucher consume failed for order " + orderId + ": " + exception.getMessage());
        }
    }

    private String extractFeignMessage(feign.FeignException exception, String fallback) {
        String content = exception.contentUTF8();
        if (content != null && content.contains("\"message\"")) {
            try {
                String[] parts = content.split("\"message\":\"");
                if (parts.length > 1) {
                    return parts[1].split("\"")[0];
                }
            } catch (Exception ignored) {
                return fallback;
            }
        }
        return fallback;
    }

    private String resolvePaymentStatus(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "PENDING";
        }
        return "COD".equalsIgnoreCase(paymentMethod) ? "PAYMENT_ON_DELIVERY" : "PENDING";
    }

    private void rollbackOrderIfCreated(Order order) {
        if (order != null && order.getId() != null) {
            try {
                orderRepository.deleteById(order.getId());
            } catch (Exception ignored) {
                // Best-effort cleanup when downstream reservation fails.
            }
        }
    }

    @PostMapping(value = "/order/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable("orderId") Long orderId, @RequestBody OrderCancelRequest cancelRequest, HttpServletRequest request) {
        String reqUserIdStr = request.getHeader("X-User-Id");
        if (reqUserIdStr == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        try {
            Order order = orderService.cancelOrder(orderId, cancelRequest.getReason(), "USER_" + reqUserIdStr);
            return new ResponseEntity<>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/admin/order/{orderId}/transition")
    public ResponseEntity<Order> transitionOrder(@PathVariable("orderId") Long orderId, @RequestBody OrderTransitionRequest transitionRequest, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        String changedBy = request.getHeader("X-User-Id");
        if (changedBy == null) changedBy = "SYSTEM";
        else changedBy = "ADMIN_" + changedBy;

        try {
            Order order = orderService.transitionOrder(orderId, transitionRequest.getTargetStatus(), transitionRequest.getReason(), changedBy, role);
            return new ResponseEntity<>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping(value = "/admin/compensations/{orderId}")
    public ResponseEntity<List<CompensationLog>> getCompensations(@PathVariable("orderId") Long orderId, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<CompensationLog> logs = compensationLogRepository.findByOrderId(orderId);
        return new ResponseEntity<>(logs, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

}
