package com.rainbowforest.orderservice.dto;

public class OrderTransitionRequest {
    private String targetStatus;
    private String reason;

    public OrderTransitionRequest() {}

    public String getTargetStatus() { return targetStatus; }
    public void setTargetStatus(String targetStatus) { this.targetStatus = targetStatus; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
