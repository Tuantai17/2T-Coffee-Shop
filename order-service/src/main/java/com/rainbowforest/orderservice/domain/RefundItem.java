package com.rainbowforest.orderservice.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "refund_items")
public class RefundItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refund_id", nullable = false)
    private Refund refund;
    
    @Column(name = "order_item_id", nullable = false)
    private Long orderItemId;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_refund_amount", nullable = false)
    private Long unitRefundAmount;
    
    @Column(name = "eligible_refund_amount", nullable = false)
    private Long eligibleRefundAmount;
    
    @Column(name = "restock_required", nullable = false)
    private Boolean restockRequired = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Refund getRefund() { return refund; }
    public void setRefund(Refund refund) { this.refund = refund; }
    
    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public Long getUnitRefundAmount() { return unitRefundAmount; }
    public void setUnitRefundAmount(Long unitRefundAmount) { this.unitRefundAmount = unitRefundAmount; }
    
    public Long getEligibleRefundAmount() { return eligibleRefundAmount; }
    public void setEligibleRefundAmount(Long eligibleRefundAmount) { this.eligibleRefundAmount = eligibleRefundAmount; }
    
    public Boolean getRestockRequired() { return restockRequired; }
    public void setRestockRequired(Boolean restockRequired) { this.restockRequired = restockRequired; }
}
