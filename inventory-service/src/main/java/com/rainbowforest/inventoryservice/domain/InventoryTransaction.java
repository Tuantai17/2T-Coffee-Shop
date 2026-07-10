package com.rainbowforest.inventoryservice.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_code", unique = true, nullable = false)
    private String transactionCode;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "type", nullable = false)
    private String type; // IMPORT, RESERVE, COMMIT, RELEASE, RESTOCK, ADJUSTMENT

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "before_on_hand")
    private int beforeOnHand;

    @Column(name = "after_on_hand")
    private int afterOnHand;

    @Column(name = "before_reserved")
    private int beforeReserved;

    @Column(name = "after_reserved")
    private int afterReserved;

    @Column(name = "reason")
    private String reason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public InventoryTransaction() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTransactionCode() { return transactionCode; }
    public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public int getBeforeOnHand() { return beforeOnHand; }
    public void setBeforeOnHand(int beforeOnHand) { this.beforeOnHand = beforeOnHand; }
    public int getAfterOnHand() { return afterOnHand; }
    public void setAfterOnHand(int afterOnHand) { this.afterOnHand = afterOnHand; }
    public int getBeforeReserved() { return beforeReserved; }
    public void setBeforeReserved(int beforeReserved) { this.beforeReserved = beforeReserved; }
    public int getAfterReserved() { return afterReserved; }
    public void setAfterReserved(int afterReserved) { this.afterReserved = afterReserved; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
