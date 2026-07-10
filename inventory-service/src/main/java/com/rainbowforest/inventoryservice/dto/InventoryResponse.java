package com.rainbowforest.inventoryservice.dto;

public class InventoryResponse {
    private Long productId;
    private Long variantId;
    private int availableQuantity;
    private int reservedQuantity;
    
    public InventoryResponse() {}

    public InventoryResponse(Long productId, Long variantId, int availableQuantity, int reservedQuantity) {
        this.productId = productId;
        this.variantId = variantId;
        this.availableQuantity = availableQuantity;
        this.reservedQuantity = reservedQuantity;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }
    public int getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }
    public int getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(int reservedQuantity) { this.reservedQuantity = reservedQuantity; }
}
