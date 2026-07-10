package com.rainbowforest.inventoryservice.dto;

import jakarta.validation.constraints.NotNull;

public class InventoryAdjustmentRequest {
    private String transactionCode;
    private Long orderId;
    
    @NotNull(message = "Product ID is required")
    private Long productId;

    private Long variantId;
    
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    
    private String reason;
    private String idempotencyKey;

    public InventoryAdjustmentRequest() {}

    public InventoryAdjustmentRequest(String transactionCode, Long orderId, Long productId, Long variantId, Integer quantity, String reason, String idempotencyKey) {
        this.transactionCode = transactionCode;
        this.orderId = orderId;
        this.productId = productId;
        this.variantId = variantId;
        this.quantity = quantity;
        this.reason = reason;
        this.idempotencyKey = idempotencyKey;
    }

    public String getTransactionCode() { return transactionCode; }
    public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
