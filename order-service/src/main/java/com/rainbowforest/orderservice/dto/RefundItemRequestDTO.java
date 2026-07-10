package com.rainbowforest.orderservice.dto;

public class RefundItemRequestDTO {
    private Long orderItemId;
    private Integer quantity;

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
