package com.rainbowforest.orderservice.dto;

public class InventoryAdjustmentRequest {
    private String transactionCode;
    private Long orderId;
    private Long orderItemId;
    private Long productId;
    private Integer quantity;
    private String reason;
    private String idempotencyKey;

    public InventoryAdjustmentRequest() {}

    public InventoryAdjustmentRequest(String transactionCode, Long orderId, Long productId, Integer quantity, String reason, String idempotencyKey) {
        this.transactionCode = transactionCode;
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.reason = reason;
        this.idempotencyKey = idempotencyKey;
    }

    public InventoryAdjustmentRequest(String transactionCode, Long orderId, Long orderItemId, Long productId, Integer quantity, String reason, String idempotencyKey) {
        this.transactionCode = transactionCode;
        this.orderId = orderId;
        this.orderItemId = orderItemId;
        this.productId = productId;
        this.quantity = quantity;
        this.reason = reason;
        this.idempotencyKey = idempotencyKey;
    }

    
    public InventoryAdjustmentRequest(Long orderId, Long orderItemId, Long productId, Integer quantity, String reason, String idempotencyKey) {
        this.orderId = orderId;
        this.orderItemId = orderItemId;
        this.productId = productId;
        this.quantity = quantity;
        this.reason = reason;
        this.idempotencyKey = idempotencyKey;
    }

    public String getTransactionCode() { return transactionCode; }
    public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
