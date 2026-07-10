package com.rainbowforest.orderservice.dto;

public class OrderCancelRequest {
    private String reason;

    public OrderCancelRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
